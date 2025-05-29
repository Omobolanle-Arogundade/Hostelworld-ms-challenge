import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ApiGateway } from './api-gateway.interface';

@Injectable()
export class AxiosApiGateway implements ApiGateway {
  private readonly logger = new Logger(AxiosApiGateway.name);

  async get<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    try {
      this.logger.debug(`Making GET request to: ${url}`);
      const response = await axios.get<T>(url, options);
      return response.data;
    } catch (error) {
      this.logger.error(`HTTP GET failed: ${error.message}`);
      throw error;
    }
  }
}
