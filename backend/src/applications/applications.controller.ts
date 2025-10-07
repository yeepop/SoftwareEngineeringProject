import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@ApiTags('領養申請')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: '提交領養申請' })
  @ApiResponse({ status: 201, description: '申請提交成功' })
  async create(@Request() req, @Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(req.user.id, createApplicationDto);
  }

  @Get('me')
  @ApiOperation({ summary: '獲取我的領養申請' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  async getMyApplications(@Request() req) {
    return this.applicationsService.findByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '獲取申請詳情' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @ApiResponse({ status: 404, description: '未找到該領養申請' })
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Get('listing/:listingId')
  @ApiOperation({ summary: '獲取特定動物的申請列表' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  async getApplicationsByListing(@Param('listingId') listingId: string) {
    return this.applicationsService.findByListing(listingId);
  }
}