import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('認證')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: '使用者登入' })
  @ApiResponse({ status: 200, description: '登入成功' })
  @ApiResponse({ status: 401, description: '登入失敗' })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: '使用者註冊' })
  @ApiResponse({ status: 201, description: '註冊成功' })
  @ApiResponse({ status: 400, description: '註冊失敗' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}