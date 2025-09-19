// src/task-assignees/dtos/task-assignee.dto.ts
import { IsUUID, IsOptional, IsObject, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class CreateTaskAssigneeDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateBulkTaskAssigneesDto {
  @IsUUID()
  taskId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  userIds: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateTaskAssigneeDto {
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AssignUsersToTaskDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  userIds: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RemoveUsersFromTaskDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  userIds: string[];
}