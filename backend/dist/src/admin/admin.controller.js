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
exports.AdminController = exports.UserRole = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const admin_service_1 = require("./admin.service");
const review_application_dto_1 = require("./dto/review-application.dto");
var UserRole;
(function (UserRole) {
    UserRole["ADOPTER"] = "adopter";
    UserRole["OWNER"] = "owner";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    checkAdminRole(user) {
        if (user.role !== UserRole.ADMIN) {
            throw new common_1.ForbiddenException('需要管理員權限');
        }
    }
    async getAllApplications(req, query) {
        this.checkAdminRole(req.user);
        const params = {
            page: query.page ? parseInt(query.page) : undefined,
            pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
            status: query.status,
        };
        return this.adminService.getAllApplications(params);
    }
    async reviewApplication(req, id, reviewDto) {
        this.checkAdminRole(req.user);
        return this.adminService.reviewApplication(id, req.user.id, reviewDto);
    }
    async getAllListings(req, query) {
        this.checkAdminRole(req.user);
        const params = {
            page: query.page ? parseInt(query.page) : undefined,
            pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
        };
        return this.adminService.getAllListings(params);
    }
    async updateListingStatus(req, id, body) {
        this.checkAdminRole(req.user);
        return this.adminService.updateListingStatus(id, body.status, req.user.id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('applications'),
    (0, swagger_1.ApiOperation)({ summary: '取得所有領養申請' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '頁碼' }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, description: '每頁筆數' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '申請狀態' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '取得成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllApplications", null);
__decorate([
    (0, common_1.Put)('applications/:id/review'),
    (0, swagger_1.ApiOperation)({ summary: '審核領養申請' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '審核完成' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '未找到該領養申請' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, review_application_dto_1.ReviewApplicationDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reviewApplication", null);
__decorate([
    (0, common_1.Get)('listings'),
    (0, swagger_1.ApiOperation)({ summary: '取得所有動物刊登' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '頁碼' }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, description: '每頁筆數' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '取得成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllListings", null);
__decorate([
    (0, common_1.Put)('listings/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: '更新動物刊登狀態' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateListingStatus", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('管理員'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map