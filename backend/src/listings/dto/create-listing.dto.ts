import { IsString, IsOptional, IsInt, IsBoolean, IsIn, IsArray, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female', 
  UNKNOWN = 'unknown'
}

export class CreateListingDto {
  @ApiProperty({ example: 'cat', description: '動物種類（cat/dog）' })
  @IsString()
  species: string;

  @ApiProperty({ example: '英國短毛貓', description: '品種', required: false })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiProperty({ example: 2, description: '年齡估計（歲）', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  @Transform(({ value }) => parseInt(value))
  ageEstimate?: number;

  @ApiProperty({ enum: Gender, example: 'female', description: '性別', required: false })
  @IsOptional()
  @IsIn(Object.values(Gender))
  gender?: Gender;

  @ApiProperty({ example: false, description: '是否已結紮', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  spayedNeutered?: boolean;

  @ApiProperty({ example: '非常親人的貓咪，喜歡跟人互動', description: '動物描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '台北市大安區', description: '所在地區' })
  @IsString()
  location: string;

  @ApiProperty({ example: ['photo1.jpg', 'photo2.jpg'], description: '照片URL列表' })
  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @ApiProperty({ example: '健康狀況良好', description: '健康狀況', required: false })
  @IsOptional()
  @IsString()
  healthStatus?: string;

  @ApiProperty({ example: { vaccines: ['三合一', '狂犬病'] }, description: '疫苗接種紀錄', required: false })
  @IsOptional()
  vaccinationRecords?: any;
}