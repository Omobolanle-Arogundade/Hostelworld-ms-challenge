// fetch-api-gateway.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ApiGateway } from './api-gateway.interface';

@Injectable()
export class FetchApiGateway implements ApiGateway {
  private readonly logger = new Logger(FetchApiGateway.name);

  async get<T>(url: string, options?: any): Promise<T> {
    try {
      this.logger.debug(`Making GET request to: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: options?.headers || {},
      });

      if (!response.ok) {
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      return data as T;
    } catch (error) {
      this.logger.error(`Fetch GET failed: ${error.message}`);
      throw error;
    }
  }
}
