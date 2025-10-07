import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { ApplicationsModule } from './applications/applications.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    ApplicationsModule,
    AdminModule,
  ],
})
export class AppModule {}