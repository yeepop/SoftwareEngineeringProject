import { PrismaService } from '../prisma/prisma.service';
import { ReviewApplicationDto } from './dto/review-application.dto';
export declare enum ApplicationStatus {
    SUBMITTED = "submitted",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum UserRole {
    ADOPTER = "adopter",
    OWNER = "owner",
    ADMIN = "admin"
}
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllApplications(params: {
        page?: number;
        pageSize?: number;
        status?: ApplicationStatus;
    }): Promise<{
        items: ({
            listing: {
                id: string;
                species: string;
                breed: string;
                location: string;
                photos: string;
            };
            applicant: {
                id: string;
                name: string;
                email: string;
            };
            reviewer: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            status: string;
            answers: string;
            submittedAt: Date;
            reviewedAt: Date | null;
            reviewNotes: string | null;
            listingId: string;
            applicantId: string | null;
            reviewerId: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    reviewApplication(applicationId: string, reviewerId: string, reviewData: ReviewApplicationDto): Promise<{
        listing: {
            owner: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            species: string;
            breed: string | null;
            ageEstimate: number | null;
            gender: string | null;
            spayedNeutered: boolean;
            description: string | null;
            location: string;
            photos: string;
            healthStatus: string | null;
            vaccinationRecords: string | null;
            status: string;
            ownerId: string;
        };
        applicant: {
            id: string;
            name: string;
            email: string;
        };
        reviewer: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        status: string;
        answers: string;
        submittedAt: Date;
        reviewedAt: Date | null;
        reviewNotes: string | null;
        listingId: string;
        applicantId: string | null;
        reviewerId: string | null;
    }>;
    getAllListings(params: {
        page?: number;
        pageSize?: number;
    }): Promise<{
        items: ({
            owner: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            species: string;
            breed: string | null;
            ageEstimate: number | null;
            gender: string | null;
            spayedNeutered: boolean;
            description: string | null;
            location: string;
            photos: string;
            healthStatus: string | null;
            vaccinationRecords: string | null;
            status: string;
            ownerId: string;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    updateListingStatus(listingId: string, status: string, adminId: string): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        species: string;
        breed: string | null;
        ageEstimate: number | null;
        gender: string | null;
        spayedNeutered: boolean;
        description: string | null;
        location: string;
        photos: string;
        healthStatus: string | null;
        vaccinationRecords: string | null;
        status: string;
        ownerId: string;
    }>;
}
