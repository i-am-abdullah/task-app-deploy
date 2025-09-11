import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './project.service';
import { ProjectsController } from './project.controller';
import { Project } from './entities/project.entity';
import { WorkspacesModule } from 'src/workspaces/workspace.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    WorkspacesModule,
    JwtModule,
    UsersModule
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}