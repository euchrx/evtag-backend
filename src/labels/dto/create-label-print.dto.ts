import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateLabelPrintDto {
  @IsUUID()
  labelItemId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  weight?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lot?: string;
}