import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewApplicationDto } from './dto/review-application.dto';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum UserRole {
  ADOPTER = 'adopter',
  OWNER = 'owner', 
  ADMIN = 'admin'
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllApplications(params: {
    page?: number;
    pageSize?: number;
    status?: ApplicationStatus;
  }) {
    const { page = 1, pageSize = 20, status } = params;
    
    const where: any = {};
    if (status) where.status = status;

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

  async reviewApplication(
    applicationId: string,
    reviewerId: string,
    reviewData: ReviewApplicationDto,
  ) {
    const application = await this.prisma.adoptionApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('未找到該領養申請');
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

    // If approved, close the listing
    if (reviewData.action === 'approve') {
      await this.prisma.animalListing.update({
        where: { id: application.listingId },
        data: { status: 'closed' },
      });
    }

    // Create audit log
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

  async getAllListings(params: {
    page?: number;
    pageSize?: number;
  }) {
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

  async updateListingStatus(listingId: string, status: string, adminId: string) {
    const listing = await this.prisma.animalListing.update({
      where: { id: listingId },
      data: { status: status as any },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    // Create audit log
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
}