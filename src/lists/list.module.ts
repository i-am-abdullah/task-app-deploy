// src/lists/list.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsService } from './list.service';
import { ListsController } from './list.controller';
import { List } from './entities/list.entity';
import { BoardsModule } from 'src/boards/board.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/user.module';
import { ProjectTeamLeadsModule } from 'src/project-team-leads/project-team-lead.module';
import { BoardMembersModule } from 'src/board-members/board-member.module';
import { RBACService } from 'src/common/rbac.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([List]),
    BoardsModule,
    JwtModule,
    UsersModule,
    ProjectTeamLeadsModule,
    BoardMembersModule
  ],
  controllers: [ListsController],
  providers: [ListsService, RBACService],
  exports: [ListsService],
})
export class ListsModule {}