import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(['SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR'])
  role!: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'OPERATOR';

  @IsOptional()
  @IsUUID()
  companyId?: string;
}