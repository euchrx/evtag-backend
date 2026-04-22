import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUserDecorator } from 'src/common/decorators/current-user.decorator';
import type { CurrentUser } from 'src/common/interfaces/current-user.interface';

type RegisterCompanyBody = {
  companyName: string;
  userName: string;
  email: string;
  password: string;
};

type LoginBody = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginBody) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  register(@Body() body: RegisterCompanyBody) {
    return this.authService.registerCompany({
      name: body.companyName,
      userName: body.userName,
      email: body.email,
      password: body.password,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUserDecorator() user: CurrentUser) {
    return this.authService.me(user);
  }
}