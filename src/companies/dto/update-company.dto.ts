import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  tradeName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  document?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cnpj?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  cep?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  street?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  number?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  district?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}