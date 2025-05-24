import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { CacheService } from '../shared/cache.service';

const CACHE_TTL = 60 * 60 * 12; // 12 hours
@Injectable()
export class MusicbrainzService {
  constructor(private readonly cacheService: CacheService) {}

  private readonly logger = new Logger(MusicbrainzService.name);
  private readonly parser = new XMLParser();

  async fetchTracklistByMbid(mbid: string): Promise<string[]> {
    const cacheKey = `mbid::${mbid}`;
    const cached = this.cacheService.get<string[]>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for MBID ${mbid}`);
      return cached;
    }

    this.logger.debug(`Fetching tracklist for MBID ${cacheKey}`);

    const url = `https://musicbrainz.org/ws/2/release/${mbid}?fmt=xml&inc=recordings`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'BrokenRecordStore/v1 (omobolanlearo@gmail.com)',
        },
      });

      const parsed = this.parser.parse(response.data);

      const tracks =
        parsed?.metadata?.release?.['medium-list']?.medium?.['track-list']
          ?.track;

      if (!tracks) return [];

      const result = Array.isArray(tracks)
        ? tracks.map((t) => t?.recording?.title || 'Unknown Track')
        : [tracks.recording?.title || 'Unknown Track'];

      this.cacheService.set(cacheKey, result, CACHE_TTL);

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch from MBID ${mbid}: ${error.message}`);
      return [];
    }
  }
}
