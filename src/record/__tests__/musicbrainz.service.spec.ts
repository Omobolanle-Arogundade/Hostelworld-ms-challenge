import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { MusicbrainzService } from '../musicbrainz.service';
import { NodeCacheService } from '../../common/cache/node-cache.service';
import { ApiGateway } from 'src/common/http/api-gateway.interface';

jest.mock('../../app.config.ts', () => {
  return {
    AppConfig: {
      author: {
        email: 'test@email.com',
      },
    },
  };
});

const loadFixture = (name: string): string =>
  fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');

const USER_AGENT = `BrokenRecordStore/v1 (test@email.com)`;

describe('MusicbrainzService', () => {
  let service: MusicbrainzService;
  let cacheService: jest.Mocked<NodeCacheService>;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let httpService: jest.Mocked<ApiGateway>;

  beforeEach(() => {
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    httpService = {
      get: jest.fn(),
    };

    service = new MusicbrainzService(cacheService, httpService);

    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTracklistByMbid', () => {
    const mbid = 'test-mbid';
    const cacheKey = `mbid::${mbid}`;
    const url = `https://musicbrainz.org/ws/2/release/${mbid}?fmt=xml&inc=recordings`;

    it('should return cached tracklist if present', async () => {
      cacheService.get.mockReturnValue(['Cached Track']);

      const result = await service.fetchTracklistByMbid(mbid);

      expect(result).toEqual(['Cached Track']);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(cacheService.set).not.toHaveBeenCalled();
      expect(loggerDebugSpy).toHaveBeenCalledWith(`Cache hit for MBID ${mbid}`);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch and parse tracklist if not cached (array)', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-array.xml');
      (httpService.get as jest.Mock).mockResolvedValue(xml);

      const result = await service.fetchTracklistByMbid(mbid);

      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);

      expect(httpService.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(httpService.get).toHaveBeenCalledTimes(1);

      expect(result).toEqual(['Track One', 'Track Two']);
      expect(cacheService.set).toHaveBeenCalledWith(
        cacheKey,
        ['Track One', 'Track Two'],
        43200,
      );
      expect(cacheService.set).toHaveBeenCalledTimes(1);
    });

    it('should return "Unknown Track" if title is missing in track recording', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-array-missing-title.xml');
      (httpService.get as jest.Mock).mockResolvedValue(xml);

      const result = await service.fetchTracklistByMbid(mbid);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);

      expect(httpService.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(httpService.get).toHaveBeenCalledTimes(1);

      expect(result).toEqual(['Unknown Track', 'Unknown Track']);

      expect(cacheService.set).toHaveBeenCalledWith(
        cacheKey,
        ['Unknown Track', 'Unknown Track'],
        43200,
      );
      expect(cacheService.set).toHaveBeenCalledTimes(1);
    });

    it('should parse single track object correctly', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-single.xml');
      (httpService.get as jest.Mock).mockResolvedValue(xml);

      const result = await service.fetchTracklistByMbid(mbid);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);

      expect(httpService.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(httpService.get).toHaveBeenCalledTimes(1);

      expect(result).toEqual(['Single Track']);

      expect(cacheService.set).toHaveBeenCalledWith(
        cacheKey,
        ['Single Track'],
        43200,
      );
      expect(cacheService.set).toHaveBeenCalledTimes(1);
    });

    it('should parse single track object with missing title', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-single-missing-title.xml');
      (httpService.get as jest.Mock).mockResolvedValue(xml);

      const result = await service.fetchTracklistByMbid(mbid);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(['Unknown Track']);
      expect(cacheService.set).toHaveBeenCalledWith(
        cacheKey,
        ['Unknown Track'],
        43200,
      );
      expect(cacheService.set).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no tracks found', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-empty.xml');
      (httpService.get as jest.Mock).mockResolvedValue(xml);

      const result = await service.fetchTracklistByMbid(mbid);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);

      expect(httpService.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(httpService.get).toHaveBeenCalledTimes(1);

      expect(result).toEqual([]);
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should retry on error and return empty array', async () => {
      cacheService.get.mockReturnValue(undefined);
      (httpService.get as jest.Mock).mockRejectedValue(
        new Error('Network failure'),
      );

      const result = await service.fetchTracklistByMbid(mbid);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);

      expect(httpService.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(httpService.get).toHaveBeenCalledTimes(3);

      expect(result).toEqual([]);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `All retries failed for MBID test-mbid: Network failure`,
      );
      expect(loggerWarnSpy).toHaveBeenCalledTimes(3);
    });

    it('should return empty array and log error if XML is malformed', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-malformed.xml');
      (httpService.get as jest.Mock).mockResolvedValue(xml);

      const result = await service.fetchTracklistByMbid(mbid);

      expect(result).toEqual([]);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('All retries failed for MBID test-mbid'),
      );
    });
  });
});
