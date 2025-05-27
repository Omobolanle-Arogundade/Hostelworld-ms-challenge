import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'User email address',
    type: String,
    example: 'user@email.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    type: String,
    example: 'password123',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
