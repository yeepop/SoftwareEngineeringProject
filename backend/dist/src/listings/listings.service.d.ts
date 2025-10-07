import { PrismaService } from '../prisma/prisma.service';
import { AnimalListing } from '@prisma/client';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
export declare enum UserRole {
    ADOPTER = "adopter",
    OWNER = "owner",
    ADMIN = "admin"
}
export declare class ListingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createListingDto: CreateListingDto): Promise<AnimalListing>;
    findAll(params: {
        page?: number;
        pageSize?: number;
        species?: string;
        location?: string;
        ageMin?: number;
        ageMax?: number;
        spayedNeutered?: boolean;
    }): Promise<{
        data: ({
            owner: {
                id: string;
                name: string;
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
    findOne(id: string): Promise<AnimalListing>;
    update(id: string, userId: string, userRole: UserRole, updateListingDto: UpdateListingDto): Promise<AnimalListing>;
    remove(id: string, userId: string, userRole: UserRole): Promise<void>;
    findByOwner(ownerId: string): Promise<AnimalListing[]>;
}
