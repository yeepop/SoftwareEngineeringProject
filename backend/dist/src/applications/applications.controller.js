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
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const applications_service_1 = require("./applications.service");
const create_application_dto_1 = require("./dto/create-application.dto");
let ApplicationsController = class ApplicationsController {
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async create(req, createApplicationDto) {
        return this.applicationsService.create(req.user.id, createApplicationDto);
    }
    async getMyApplications(req) {
        return this.applicationsService.findByUser(req.user.id);
    }
    async findOne(id) {
        return this.applicationsService.findOne(id);
    }
    async getApplicationsByListing(listingId) {
        return this.applicationsService.findByListing(listingId);
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '提交領養申請' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '申請提交成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_application_dto_1.CreateApplicationDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: '獲取我的領養申請' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '獲取成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getMyApplications", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '獲取申請詳情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '獲取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '未找到該領養申請' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('listing/:listingId'),
    (0, swagger_1.ApiOperation)({ summary: '獲取特定動物的申請列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '獲取成功' }),
    __param(0, (0, common_1.Param)('listingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getApplicationsByListing", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, swagger_1.ApiTags)('領養申請'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('applications'),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map