import { IsString, IsObject, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({ example: 'uuid-here', description: '動物刊登ID' })
  @IsString()
  @IsUUID()
  listingId: string;

  @ApiProperty({ 
    example: {
      experience: '曾經飼養過貓2年',
      housing: '自有房屋有庭院',
      reason: '希望給流浪貓一個溫暖的家'
    },
    description: '領養申請答案' 
  })
  @IsObject()
  answers: any;
}