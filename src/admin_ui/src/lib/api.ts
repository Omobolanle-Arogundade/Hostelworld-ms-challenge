import axios from 'axios';
import type { RecordItem } from './types';
import type { PaginatedResponseDto } from '../../../shared/dtos/paginated-response.dto';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchRecords(): Promise<
  PaginatedResponseDto<RecordItem>
> {
  const response = await api.get<PaginatedResponseDto<RecordItem>>('/records');
  return response.data;
}

export async function createRecord(
  data: Partial<RecordItem>,
): Promise<RecordItem> {
  const response = await api.post<RecordItem>('/records', data);
  return response.data;
}

export async function updateRecord(
  id: string,
  data: Partial<RecordItem>,
): Promise<RecordItem> {
  const response = await api.put<RecordItem>(`/records/${id}`, data);
  return response.data;
}
