import { CreateRecordRequestDto } from './create-record.request.dto';

export interface CreateRecordPayloadDto extends CreateRecordRequestDto {
  createdBy: string;
}
