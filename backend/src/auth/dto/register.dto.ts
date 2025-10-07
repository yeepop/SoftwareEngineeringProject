import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADOPTER = 'adopter',
  OWNER = 'owner', 
  ADMIN = 'admin'
}

export class RegisterDto {
  @ApiProperty({ example: '王小明', description: '使用者姓名' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@example.com', description: '電子郵件' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '密碼（至少6位數）' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.ADOPTER, description: '使用者角色', required: false })
  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: UserRole = UserRole.ADOPTER;
}