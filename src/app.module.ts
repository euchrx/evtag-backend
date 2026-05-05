import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { LabelsModule } from './labels/labels.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MobileModule } from './mobile/mobile.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    LabelsModule,
    CategoriesModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    DashboardModule,
    MobileModule,
    AdminModule,
  ],
})
export class AppModule {}