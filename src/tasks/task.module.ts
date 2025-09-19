// src/tasks/task.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './task.service';
import { TasksController } from './task.controller';
import { Task } from './entities/task.entity';
import { ListsModule } from 'src/lists/list.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/user.module';
import { ProjectTeamLeadsModule } from 'src/project-team-leads/project-team-lead.module';
import { BoardMembersModule } from 'src/board-members/board-member.module';
import { TaskAssigneeModule } from 'src/task-assignees/task-assignee.module';
import { RBACService } from 'src/common/rbac.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    ListsModule,
    JwtModule,
    UsersModule,
    ProjectTeamLeadsModule,
    BoardMembersModule,
    forwardRef(() => TaskAssigneeModule), // Using forwardRef to avoid circular dependency
  ],
  controllers: [TasksController],
  providers: [TasksService, RBACService],
  exports: [TasksService],
})
export class TasksModule {}