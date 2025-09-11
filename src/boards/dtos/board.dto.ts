import { IsString, IsOptional, MinLength, IsUUID, IsEnum, IsObject } from 'class-validator';
import { BoardStatus } from 'src/enums';

export class CreateBoardDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BoardStatus)
  status?: BoardStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BoardStatus)
  status?: BoardStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}