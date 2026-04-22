import { LabelItemType } from "src/generated/prisma/enums";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID, IsString, MaxLength, Min } from 'class-validator';

export class UpdateLabelItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(LabelItemType)
  itemType?: LabelItemType;

  @IsOptional()
  @IsInt()
  @Min(1)
  defaultShelfLifeHours?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}