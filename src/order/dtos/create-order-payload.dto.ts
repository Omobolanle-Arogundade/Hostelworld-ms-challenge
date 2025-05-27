import { CreateOrderDto } from './create-order.dto';

export interface CreateOrderPayloadDto extends CreateOrderDto {
  userId: string;
}
