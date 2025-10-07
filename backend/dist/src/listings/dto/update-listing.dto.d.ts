import { CreateListingDto } from './create-listing.dto';
export declare enum ListingStatus {
    DRAFT = "draft",
    PENDING = "pending",
    ACTIVE = "active",
    CLOSED = "closed"
}
declare const UpdateListingDto_base: import("@nestjs/common").Type<Partial<CreateListingDto>>;
export declare class UpdateListingDto extends UpdateListingDto_base {
    status?: ListingStatus;
}
export {};
