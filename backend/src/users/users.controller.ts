import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@ApiTags('使用者')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: '獲取當前使用者資訊' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  async getProfile(@Request() req) {
    const { passwordHash, ...user } = req.user;
    return user;
  }

  @Get(':id')
  @ApiOperation({ summary: '獲取使用者公開資訊' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @ApiResponse({ status: 404, description: '使用者不存在' })
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new Error('使用者不存在');
    }
    // Return only public info
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }
}