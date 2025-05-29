import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './order.schema';
import { CustomThrottlerGuard } from '../common/guards/custom-throttler.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';
import { AuthenticatedRequestDto } from '../shared/dtos/authenticate-request.dto';
import { Public } from '../common/decorators/public.decorator';
import { MostOrderedRecordsDto } from './dtos/most-ordered-records.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Roles(Role.USER)
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload or insufficient stock',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body() dto: CreateOrderDto,
    @Req() req: AuthenticatedRequestDto,
  ): Promise<Order> {
    return this.orderService.createOrder({
      ...dto,
      userId: req.user['userId'],
    });
  }

  @UseGuards(CustomThrottlerGuard)
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get('most-ordered')
  @ApiOperation({ summary: 'Fetch most ordered records' })
  @ApiResponse({
    status: 200,
    description: 'List of most ordered records',
    type: [MostOrderedRecordsDto],
  })
  async fetchMostOrderedRecords(): Promise<MostOrderedRecordsDto[]> {
    return this.orderService.fetchMostOrderedRecords();
  }
}
