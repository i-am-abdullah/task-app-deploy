// src/task-assignees/task-assignee.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskAssigneeService } from './task-assignee.service';
import { TaskAssigneeController } from './task-assignee.controller';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TasksModule } from 'src/tasks/task.module';
import { UsersModule } from 'src/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ProjectTeamLeadsModule } from 'src/project-team-leads/project-team-lead.module';
import { BoardMembersModule } from 'src/board-members/board-member.module';
import { RBACService } from 'src/common/rbac.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskAssignee]),
    forwardRef(() => TasksModule), // Using forwardRef to avoid circular dependency
    UsersModule,
    JwtModule,
    ProjectTeamLeadsModule,
    BoardMembersModule
  ],
  controllers: [TaskAssigneeController],
  providers: [TaskAssigneeService, RBACService],
  exports: [TaskAssigneeService],
})
export class TaskAssigneeModule {}