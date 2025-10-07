import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';
import { CreateListingDto } from './create-listing.dto';

export enum ListingStatus {
  DRAFT = 'draft',
  PENDING = 'pending', 
  ACTIVE = 'active',
  CLOSED = 'closed'
}

export class UpdateListingDto extends PartialType(CreateListingDto) {
  @IsOptional()
  @IsIn(Object.values(ListingStatus))
  status?: ListingStatus;
}