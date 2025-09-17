import { IsString, IsOptional, MinLength, IsUUID, IsEnum, IsObject, IsNumber, Min } from 'class-validator';
import { ListStatus } from 'src/enums';

export class CreateListDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsUUID()
  boardId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ListStatus)
  status?: ListStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateListDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ListStatus)
  status?: ListStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}