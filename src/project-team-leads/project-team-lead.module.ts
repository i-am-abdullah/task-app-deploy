import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTeamLeadsService } from './project-team-lead.service';
import { ProjectTeamLeadsController } from './project-team-lead.controller';
import { ProjectTeamLead } from './entities/project-team-lead.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectTeamLead]), JwtModule, UsersModule],
  controllers: [ProjectTeamLeadsController],
  providers: [ProjectTeamLeadsService],
  exports: [ProjectTeamLeadsService],
})
export class ProjectTeamLeadsModule {}