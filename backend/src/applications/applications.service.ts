import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdoptionApplication } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto';

export enum UserRole {
  ADOPTER = 'adopter',
  OWNER = 'owner', 
  ADMIN = 'admin'
}

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createApplicationDto: CreateApplicationDto): Promise<AdoptionApplication> {
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

  async findByUser(userId: string): Promise<AdoptionApplication[]> {
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

  async findOne(id: string): Promise<AdoptionApplication> {
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
      throw new NotFoundException('未找到該領養申請');
    }

    return application;
  }

  async findByListing(listingId: string): Promise<AdoptionApplication[]> {
    return this.prisma.adoptionApplication.findMany({
      where: { listingId },
      include: {
        applicant: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }
}