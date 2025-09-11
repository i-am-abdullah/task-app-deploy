import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateProjectTeamLeadDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateProjectTeamLeadDto {
  @IsOptional()
  @IsString()
  role?: string;
}