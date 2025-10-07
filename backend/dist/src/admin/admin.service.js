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
exports.AdminService = exports.UserRole = exports.ApplicationStatus = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["SUBMITTED"] = "submitted";
    ApplicationStatus["UNDER_REVIEW"] = "under_review";
    ApplicationStatus["APPROVED"] = "approved";
    ApplicationStatus["REJECTED"] = "rejected";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["ADOPTER"] = "adopter";
    UserRole["OWNER"] = "owner";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllApplications(params) {
        const { page = 1, pageSize = 20, status } = params;
        const where = {};
        if (status)
            where.status = status;
        const [items, total] = await Promise.all([
            this.prisma.adoptionApplication.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    listing: {
                        select: {
                            id: true,
                            species: true,
                            breed: true,
                            photos: true,
                            location: true,
                        },
                    },
                    applicant: { select: { id: true, name: true, email: true } },
                    reviewer: { select: { id: true, name: true } },
                },
                orderBy: { submittedAt: 'desc' },
            }),
            this.prisma.adoptionApplication.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async reviewApplication(applicationId, reviewerId, reviewData) {
        const application = await this.prisma.adoptionApplication.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException('未找到該領養申請');
        }
        const updatedApplication = await this.prisma.adoptionApplication.update({
            where: { id: applicationId },
            data: {
                status: reviewData.action === 'approve' ? 'approved' : 'rejected',
                reviewNotes: reviewData.notes,
                reviewerId,
                reviewedAt: new Date(),
            },
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
        if (reviewData.action === 'approve') {
            await this.prisma.animalListing.update({
                where: { id: application.listingId },
                data: { status: 'closed' },
            });
        }
        await this.prisma.auditLog.create({
            data: {
                actorId: reviewerId,
                action: `application_${reviewData.action}`,
                targetType: 'AdoptionApplication',
                targetId: applicationId,
                notes: reviewData.notes,
            },
        });
        return updatedApplication;
    }
    async getAllListings(params) {
        const { page = 1, pageSize = 20 } = params;
        const [items, total] = await Promise.all([
            this.prisma.animalListing.findMany({
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    owner: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.animalListing.count(),
        ]);
        return {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async updateListingStatus(listingId, status, adminId) {
        const listing = await this.prisma.animalListing.update({
            where: { id: listingId },
            data: { status: status },
            include: {
                owner: { select: { id: true, name: true, email: true } },
            },
        });
        await this.prisma.auditLog.create({
            data: {
                actorId: adminId,
                action: `listing_status_update_${status}`,
                targetType: 'AnimalListing',
                targetId: listingId,
                notes: `Updated listing status to ${status}`,
            },
        });
        return listing;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map