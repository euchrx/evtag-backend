import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUserDecorator } from 'src/common/decorators/current-user.decorator';
import type { CurrentUser } from 'src/common/interfaces/current-user.interface';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  create(
    @Body() dto: CreateUserDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.usersService.create(dto, user);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  findAll(@CurrentUserDecorator() user: CurrentUser) {
    return this.usersService.findAll(user);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  findOne(
    @Param('id') id: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.usersService.findById(id, user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.usersService.update(id, dto, user);
  }
}