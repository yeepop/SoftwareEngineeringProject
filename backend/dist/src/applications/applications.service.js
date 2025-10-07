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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = exports.UserRole = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var UserRole;
(function (UserRole) {
    UserRole["ADOPTER"] = "adopter";
    UserRole["OWNER"] = "owner";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
let ApplicationsService = class ApplicationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createApplicationDto) {
        return this.prisma.adoptionApplication.create({
            data: {
                ...createApplicationDto,
                applicantId: userId,
            },
            include: {
                listing: {
                    include: {
                        owner: { select: { id: true, name: true } },
                    },
                },
                applicant: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async findByUser(userId) {
        return this.prisma.adoptionApplication.findMany({
            where: { applicantId: userId },
            include: {
                listing: {
                    select: {
                        id: true,
                        species: true,
                        breed: true,
                        photos: true,
                        status: true,
                    },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });
    }
    async findOne(id) {
        const application = await this.prisma.adoptionApplication.findUnique({
            where: { id },
            include: {
                listing: {
                    include: {
                        owner: { select: { id: true, name: true, email: true } },
                    },
                },
                applicant: { select: { id: true, name: true, email: true } },
                reviewer: { select: { id: true, name: true } },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('未找到該領養申請');
        }
        return application;
    }
    async findByListing(listingId) {
        return this.prisma.adoptionApplication.findMany({
            where: { listingId },
            include: {
                applicant: { select: { id: true, name: true, email: true } },
            },
            orderBy: { submittedAt: 'asc' },
        });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map