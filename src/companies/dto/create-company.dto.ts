import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  tradeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  document?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cnpj?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  cep?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;
}