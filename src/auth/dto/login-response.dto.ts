import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/user.schema';

export class LoginResponseDto {
  @ApiProperty({
    description: 'User access token',
    required: true,
  })
  access_token: string;

  user: Partial<User>;
}
