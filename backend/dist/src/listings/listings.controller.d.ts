import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    create(req: any, createListingDto: CreateListingDto): Promise<{
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
    findAll(query: any): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, req: any, updateListingDto: UpdateListingDto): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    getMyListings(req: any): Promise<{
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
    }[]>;
}
