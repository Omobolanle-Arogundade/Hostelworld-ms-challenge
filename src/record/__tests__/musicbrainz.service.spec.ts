import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import { MusicbrainzService } from '../musicbrainz.service';
import { NodeCacheService } from '../../common/cache/node-cache.service';

jest.mock('axios');

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

  beforeEach(() => {
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    service = new MusicbrainzService(cacheService);

    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
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
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should fetch and parse tracklist if not cached (array)', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-array.xml');
      (axios.get as jest.Mock).mockResolvedValue({ data: xml });

      const result = await service.fetchTracklistByMbid(mbid);

      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);

      expect(axios.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(axios.get).toHaveBeenCalledTimes(1);

      expect(result).toEqual(['Track One', 'Track Two']);
      expect(cacheService.set).toHaveBeenCalledWith(
        cacheKey,
        ['Track One', 'Track Two'],
        43200,
      );
      expect(cacheService.set).toHaveBeenCalledTimes(1);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        `Fetching tracklist for MBID ${cacheKey}`,
      );
    });

    it('should return "Unknown Track" if title is missing in track recording', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-array-missing-title.xml');
      (axios.get as jest.Mock).mockResolvedValue({ data: xml });

      const result = await service.fetchTracklistByMbid(mbid);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);

      expect(axios.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(axios.get).toHaveBeenCalledTimes(1);

      expect(result).toEqual(['Unknown Track', 'Unknown Track']);

      expect(cacheService.set).toHaveBeenCalledWith(
        cacheKey,
        ['Unknown Track', 'Unknown Track'],
        43200,
      );
      expect(cacheService.set).toHaveBeenCalledTimes(1);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        `Fetching tracklist for MBID ${cacheKey}`,
      );
    });

    it('should parse single track object correctly', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-single.xml');
      (axios.get as jest.Mock).mockResolvedValue({ data: xml });

      const result = await service.fetchTracklistByMbid(mbid);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);

      expect(axios.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(axios.get).toHaveBeenCalledTimes(1);

      expect(result).toEqual(['Single Track']);

      expect(cacheService.set).toHaveBeenCalledWith(
        cacheKey,
        ['Single Track'],
        43200,
      );
      expect(cacheService.set).toHaveBeenCalledTimes(1);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        `Fetching tracklist for MBID ${cacheKey}`,
      );
    });

    it('should parse single track object with missing title', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-single-missing-title.xml');
      (axios.get as jest.Mock).mockResolvedValue({
        data: xml,
      });

      const result = await service.fetchTracklistByMbid(mbid);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(['Unknown Track']);
      expect(cacheService.set).toHaveBeenCalledWith(
        cacheKey,
        ['Unknown Track'],
        43200,
      );
      expect(cacheService.set).toHaveBeenCalledTimes(1);
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        `Fetching tracklist for MBID ${cacheKey}`,
      );
    });

    it('should return empty array if no tracks found', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-empty.xml');
      (axios.get as jest.Mock).mockResolvedValue({ data: xml });

      const result = await service.fetchTracklistByMbid(mbid);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);

      expect(axios.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(axios.get).toHaveBeenCalledTimes(1);

      expect(result).toEqual([]);
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should return empty array and log on error', async () => {
      cacheService.get.mockReturnValue(undefined);
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network failure'));

      const result = await service.fetchTracklistByMbid(mbid);
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.get).toHaveBeenCalledTimes(1);

      expect(axios.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      expect(axios.get).toHaveBeenCalledTimes(1);

      expect(result).toEqual([]);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Failed to fetch from MBID ${mbid}: Network failure`,
      );
    });

    it('should return empty array and log error if XML is malformed', async () => {
      cacheService.get.mockReturnValue(undefined);

      const xml = loadFixture('tracklist-malformed.xml');
      (axios.get as jest.Mock).mockResolvedValue({
        data: xml,
      });

      const result = await service.fetchTracklistByMbid(mbid);

      expect(result).toEqual([]);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch from MBID'),
      );
    });
  });
});
