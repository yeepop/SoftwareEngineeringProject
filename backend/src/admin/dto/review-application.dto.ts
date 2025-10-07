import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ReviewAction {
  approve = 'approve',
  reject = 'reject',
}

export class ReviewApplicationDto {
  @ApiProperty({ enum: ReviewAction, description: '審核動作' })
  @IsEnum(ReviewAction)
  action: ReviewAction;

  @ApiProperty({ example: '申請者符合領養條件', description: '審核備註', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}