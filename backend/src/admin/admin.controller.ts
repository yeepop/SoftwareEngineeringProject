import { Controller, Get, Put, Body, Param, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { ReviewApplicationDto } from './dto/review-application.dto';

export enum UserRole {
  ADOPTER = 'adopter',
  OWNER = 'owner', 
  ADMIN = 'admin'
}

@ApiTags('管理員')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdminRole(user: any) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('需要管理員權限');
    }
  }

  @Get('applications')
  @ApiOperation({ summary: '取得所有領養申請' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每頁筆數' })
  @ApiQuery({ name: 'status', required: false, description: '申請狀態' })
  @ApiResponse({ status: 200, description: '取得成功' })
  async getAllApplications(@Request() req, @Query() query: any) {
    this.checkAdminRole(req.user);
    
    const params = {
      page: query.page ? parseInt(query.page) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
      status: query.status,
    };
    return this.adminService.getAllApplications(params);
  }

  @Put('applications/:id/review')
  @ApiOperation({ summary: '審核領養申請' })
  @ApiResponse({ status: 200, description: '審核完成' })
  @ApiResponse({ status: 404, description: '未找到該領養申請' })
  async reviewApplication(
    @Request() req,
    @Param('id') id: string,
    @Body() reviewDto: ReviewApplicationDto,
  ) {
    this.checkAdminRole(req.user);
    return this.adminService.reviewApplication(id, req.user.id, reviewDto);
  }

  @Get('listings')
  @ApiOperation({ summary: '取得所有動物刊登' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每頁筆數' })
  @ApiResponse({ status: 200, description: '取得成功' })
  async getAllListings(@Request() req, @Query() query: any) {
    this.checkAdminRole(req.user);
    
    const params = {
      page: query.page ? parseInt(query.page) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
    };
    return this.adminService.getAllListings(params);
  }

  @Put('listings/:id/status')
  @ApiOperation({ summary: '更新動物刊登狀態' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateListingStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    this.checkAdminRole(req.user);
    return this.adminService.updateListingStatus(id, body.status, req.user.id);
  }
}