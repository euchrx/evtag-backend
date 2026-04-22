import { LabelItemType } from "src/generated/prisma/enums";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID, IsString, MaxLength, Min } from 'class-validator';

export class CreateLabelItemDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsUUID()
  categoryId!: string;

  @IsEnum(LabelItemType)
  itemType!: LabelItemType;

  @IsInt()
  @Min(1)
  defaultShelfLifeHours!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}