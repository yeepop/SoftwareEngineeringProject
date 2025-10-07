export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    UNKNOWN = "unknown"
}
export declare class CreateListingDto {
    species: string;
    breed?: string;
    ageEstimate?: number;
    gender?: Gender;
    spayedNeutered?: boolean;
    description?: string;
    location: string;
    photos: string[];
    healthStatus?: string;
    vaccinationRecords?: any;
}
