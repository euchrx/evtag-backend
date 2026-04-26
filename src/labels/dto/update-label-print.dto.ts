import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { LabelWeightUnit } from 'src/generated/prisma/enums';

export class UpdateLabelPrintDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  lot?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  weight?: number | null;

  @IsOptional()
  @IsEnum(LabelWeightUnit)
  weightUnit?: LabelWeightUnit;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsDateString()
  originalExpiresAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  brandOrSupplier?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  sif?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  responsible?: string | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  showQr?: boolean;
}