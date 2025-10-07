import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ApplicationsModule } from '../applications/applications.module';
import { ListingsModule } from '../listings/listings.module';

@Module({
  imports: [ApplicationsModule, ListingsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}