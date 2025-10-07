import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: '電子郵件' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '密碼' })
  @IsString()
  password: string;
}