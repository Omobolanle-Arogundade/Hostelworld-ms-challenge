import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (
      !user ||
      !(await this.userService.validatePassword(password, user.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }

  async login(user: User): Promise<LoginResponseDto> {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
