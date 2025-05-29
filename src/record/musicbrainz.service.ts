import { Inject, Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { AppConfig } from '../app.config';
import { CacheInterface } from '../common/cache/cache.interface';
import { ApiGateway } from '../common/http/api-gateway.interface';

const CACHE_TTL = 60 * 60 * 12;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

@Injectable()
export class MusicbrainzService {
  private readonly logger = new Logger(MusicbrainzService.name);
  private readonly parser = new XMLParser();

  constructor(
    @Inject('CacheInterface') private readonly cacheService: CacheInterface,
    @Inject('ApiGateway') private readonly api: ApiGateway,
  ) {}

  async fetchTracklistByMbid(mbid: string): Promise<string[]> {
    const cacheKey = `mbid::${mbid}`;
    const cached = await this.cacheService.get<string[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for MBID ${mbid}`);
      return cached;
    }

    const url = `https://musicbrainz.org/ws/2/release/${mbid}?fmt=xml&inc=recordings`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const data = await this.api.get<string>(url, {
          headers: {
            'User-Agent': `BrokenRecordStore/v1 (${AppConfig?.author?.email})`,
          },
        });

        const parsed = this.parser.parse(data);

        const tracks =
          parsed?.metadata?.release?.['medium-list']?.medium?.['track-list']
            ?.track;

        if (!tracks) return [];

        const result = Array.isArray(tracks)
          ? tracks.map((t) => t?.recording?.title || 'Unknown Track')
          : [tracks?.recording?.title || 'Unknown Track'];

        this.cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
      } catch (err) {
        this.logger.warn(
          `Attempt ${attempt} failed for MBID ${mbid}: ${err.message}`,
        );
        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          this.logger.error(
            `All retries failed for MBID ${mbid}: ${err.message}`,
          );
        }
      }
    }

    return [];
  }
}
