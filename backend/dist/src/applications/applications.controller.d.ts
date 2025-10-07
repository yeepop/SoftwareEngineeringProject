import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(req: any, createApplicationDto: CreateApplicationDto): Promise<{
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
    getMyApplications(req: any): Promise<{
        id: string;
        status: string;
        answers: string;
        submittedAt: Date;
        reviewedAt: Date | null;
        reviewNotes: string | null;
        listingId: string;
        applicantId: string | null;
        reviewerId: string | null;
    }[]>;
    findOne(id: string): Promise<{
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
    getApplicationsByListing(listingId: string): Promise<{
        id: string;
        status: string;
        answers: string;
        submittedAt: Date;
        reviewedAt: Date | null;
        reviewNotes: string | null;
        listingId: string;
        applicantId: string | null;
        reviewerId: string | null;
    }[]>;
}
