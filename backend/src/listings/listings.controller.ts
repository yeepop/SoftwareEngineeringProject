import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@ApiTags('動物刊登')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '建立動物刊登' })
  @ApiResponse({ status: 201, description: '建立成功' })
  async create(@Request() req, @Body() createListingDto: CreateListingDto) {
    return this.listingsService.create(req.user.id, createListingDto);
  }

  @Get()
  @ApiOperation({ summary: '取得動物刊登列表' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每頁筆數' })
  @ApiQuery({ name: 'species', required: false, description: '動物種類' })
  @ApiQuery({ name: 'location', required: false, description: '所在地區' })
  @ApiQuery({ name: 'ageMin', required: false, description: '最小年齡' })
  @ApiQuery({ name: 'ageMax', required: false, description: '最大年齡' })
  @ApiQuery({ name: 'spayedNeutered', required: false, description: '是否已結紮' })
  @ApiResponse({ status: 200, description: '取得成功' })
  async findAll(@Query() query: any) {
    const params = {
      page: query.page ? parseInt(query.page) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
      species: query.species,
      location: query.location,
      ageMin: query.ageMin ? parseInt(query.ageMin) : undefined,
      ageMax: query.ageMax ? parseInt(query.ageMax) : undefined,
      spayedNeutered: query.spayedNeutered === 'true' ? true : query.spayedNeutered === 'false' ? false : undefined,
    };
    return this.listingsService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: '取得特定動物刊登詳情' })
  @ApiResponse({ status: 200, description: '取得成功' })
  @ApiResponse({ status: 404, description: '未找到該動物資訊' })
  async findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: '更新動物刊登' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '無權修改此動物資訊' })
  async update(@Param('id') id: string, @Request() req, @Body() updateListingDto: UpdateListingDto) {
    return this.listingsService.update(id, req.user.id, req.user.role, updateListingDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '刪除動物刊登' })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 403, description: '無權刪除此動物資訊' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.listingsService.remove(id, req.user.id, req.user.role);
    return { message: '刪除成功' };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('owner/me')
  @ApiOperation({ summary: '取得我的動物刊登' })
  @ApiResponse({ status: 200, description: '取得成功' })
  async getMyListings(@Request() req) {
    return this.listingsService.findByOwner(req.user.id);
  }
}