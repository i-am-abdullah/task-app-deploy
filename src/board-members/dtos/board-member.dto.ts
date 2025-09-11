import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateBoardMemberDto {
  @IsUUID()
  boardId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateBoardMemberDto {
  @IsOptional()
  @IsString()
  role?: string;
}