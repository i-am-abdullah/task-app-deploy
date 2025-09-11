import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './board.service';
import { BoardsController } from './board.controller';
import { Board } from './entities/board.entity';
import { ProjectsModule } from 'src/projects/project.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),
    ProjectsModule,
    JwtModule,
    UsersModule
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}