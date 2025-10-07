import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnimalListing, Prisma } from '@prisma/client';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

export enum UserRole {
  ADOPTER = 'adopter',
  OWNER = 'owner', 
  ADMIN = 'admin'
}

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createListingDto: CreateListingDto): Promise<AnimalListing> {
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

  async findAll(params: {
    page?: number;
    pageSize?: number;
    species?: string;
    location?: string;
    ageMin?: number;
    ageMax?: number;
    spayedNeutered?: boolean;
  }) {
    const { page = 1, pageSize = 20, species, location, ageMin, ageMax, spayedNeutered } = params;
    
    const where: Prisma.AnimalListingWhereInput = {
      status: 'active',
    };

    if (species) where.species = species;
    if (location) where.location = { contains: location };
    if (spayedNeutered !== undefined) where.spayedNeutered = spayedNeutered;
    if (ageMin !== undefined || ageMax !== undefined) {
      where.ageEstimate = {};
      if (ageMin !== undefined) where.ageEstimate.gte = ageMin;
      if (ageMax !== undefined) where.ageEstimate.lte = ageMax;
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

  async findOne(id: string): Promise<AnimalListing> {
    const listing = await this.prisma.animalListing.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('未找到該動物資訊');
    }

    return listing;
  }

  async update(id: string, userId: string, userRole: UserRole, updateListingDto: UpdateListingDto): Promise<AnimalListing> {
    const listing = await this.findOne(id);
    
    // Check if user is owner or admin
    if (listing.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('無權修改此動物資訊');
    }

    const updateData: any = { ...updateListingDto };

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

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const listing = await this.findOne(id);
    
    // Check if user is owner or admin
    if (listing.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('無權刪除此動物資訊');
    }

    await this.prisma.animalListing.delete({ where: { id } });
  }

  async findByOwner(ownerId: string): Promise<AnimalListing[]> {
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
}