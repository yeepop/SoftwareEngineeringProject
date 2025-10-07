import { AdminService } from './admin.service';
import { ReviewApplicationDto } from './dto/review-application.dto';
export declare enum UserRole {
    ADOPTER = "adopter",
    OWNER = "owner",
    ADMIN = "admin"
}
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    private checkAdminRole;
    getAllApplications(req: any, query: any): Promise<{
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
    reviewApplication(req: any, id: string, reviewDto: ReviewApplicationDto): Promise<{
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
    getAllListings(req: any, query: any): Promise<{
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
    updateListingStatus(req: any, id: string, body: {
        status: string;
    }): Promise<{
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
