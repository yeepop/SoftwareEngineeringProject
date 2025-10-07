import { PrismaService } from '../prisma/prisma.service';
import { AdoptionApplication } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto';
export declare enum UserRole {
    ADOPTER = "adopter",
    OWNER = "owner",
    ADMIN = "admin"
}
export declare class ApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createApplicationDto: CreateApplicationDto): Promise<AdoptionApplication>;
    findByUser(userId: string): Promise<AdoptionApplication[]>;
    findOne(id: string): Promise<AdoptionApplication>;
    findByListing(listingId: string): Promise<AdoptionApplication[]>;
}
