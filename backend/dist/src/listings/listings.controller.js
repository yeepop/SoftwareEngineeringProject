"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const listings_service_1 = require("./listings.service");
const create_listing_dto_1 = require("./dto/create-listing.dto");
const update_listing_dto_1 = require("./dto/update-listing.dto");
let ListingsController = class ListingsController {
    constructor(listingsService) {
        this.listingsService = listingsService;
    }
    async create(req, createListingDto) {
        return this.listingsService.create(req.user.id, createListingDto);
    }
    async findAll(query) {
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
    async findOne(id) {
        return this.listingsService.findOne(id);
    }
    async update(id, req, updateListingDto) {
        return this.listingsService.update(id, req.user.id, req.user.role, updateListingDto);
    }
    async remove(id, req) {
        await this.listingsService.remove(id, req.user.id, req.user.role);
        return { message: '刪除成功' };
    }
    async getMyListings(req) {
        return this.listingsService.findByOwner(req.user.id);
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '建立動物刊登' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '建立成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_listing_dto_1.CreateListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '取得動物刊登列表' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '頁碼' }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, description: '每頁筆數' }),
    (0, swagger_1.ApiQuery)({ name: 'species', required: false, description: '動物種類' }),
    (0, swagger_1.ApiQuery)({ name: 'location', required: false, description: '所在地區' }),
    (0, swagger_1.ApiQuery)({ name: 'ageMin', required: false, description: '最小年齡' }),
    (0, swagger_1.ApiQuery)({ name: 'ageMax', required: false, description: '最大年齡' }),
    (0, swagger_1.ApiQuery)({ name: 'spayedNeutered', required: false, description: '是否已結紮' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '取得成功' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '取得特定動物刊登詳情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '取得成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '未找到該動物資訊' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新動物刊登' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '無權修改此動物資訊' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_listing_dto_1.UpdateListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '刪除動物刊登' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '刪除成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '無權刪除此動物資訊' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('owner/me'),
    (0, swagger_1.ApiOperation)({ summary: '取得我的動物刊登' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '取得成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "getMyListings", null);
exports.ListingsController = ListingsController = __decorate([
    (0, swagger_1.ApiTags)('動物刊登'),
    (0, common_1.Controller)('listings'),
    __metadata("design:paramtypes", [listings_service_1.ListingsService])
], ListingsController);
//# sourceMappingURL=listings.controller.js.map