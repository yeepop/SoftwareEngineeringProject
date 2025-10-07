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
exports.ListingsService = exports.UserRole = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var UserRole;
(function (UserRole) {
    UserRole["ADOPTER"] = "adopter";
    UserRole["OWNER"] = "owner";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
let ListingsService = class ListingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createListingDto) {
        const { photos, vaccinationRecords, ...data } = createListingDto;
        return this.prisma.animalListing.create({
            data: {
                ...data,
                ownerId: userId,
                photos: JSON.stringify(photos || []),
                vaccinationRecords: vaccinationRecords ? JSON.stringify(vaccinationRecords) : null,
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async findAll(params) {
        const { page = 1, pageSize = 20, species, location, ageMin, ageMax, spayedNeutered } = params;
        const where = {
            status: 'active',
        };
        if (species)
            where.species = species;
        if (location)
            where.location = { contains: location };
        if (spayedNeutered !== undefined)
            where.spayedNeutered = spayedNeutered;
        if (ageMin !== undefined || ageMax !== undefined) {
            where.ageEstimate = {};
            if (ageMin !== undefined)
                where.ageEstimate.gte = ageMin;
            if (ageMax !== undefined)
                where.ageEstimate.lte = ageMax;
        }
        const [items, total] = await Promise.all([
            this.prisma.animalListing.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    owner: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.animalListing.count({ where }),
        ]);
        return {
            data: items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async findOne(id) {
        const listing = await this.prisma.animalListing.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        if (!listing) {
            throw new common_1.NotFoundException('未找到該動物資訊');
        }
        return listing;
    }
    async update(id, userId, userRole, updateListingDto) {
        const listing = await this.findOne(id);
        if (listing.ownerId !== userId && userRole !== UserRole.ADMIN) {
            throw new common_1.ForbiddenException('無權修改此動物資訊');
        }
        const updateData = { ...updateListingDto };
        return this.prisma.animalListing.update({
            where: { id },
            data: updateData,
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async remove(id, userId, userRole) {
        const listing = await this.findOne(id);
        if (listing.ownerId !== userId && userRole !== UserRole.ADMIN) {
            throw new common_1.ForbiddenException('無權刪除此動物資訊');
        }
        await this.prisma.animalListing.delete({ where: { id } });
    }
    async findByOwner(ownerId) {
        return this.prisma.animalListing.findMany({
            where: { ownerId },
            include: {
                owner: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListingsService);
//# sourceMappingURL=listings.service.js.map