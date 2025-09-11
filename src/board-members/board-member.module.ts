import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMembersService } from './board-member.service';
import { BoardMembersController } from './board-member.controller';
import { BoardMember } from './entities/board-member.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([BoardMember]), JwtModule, UsersModule],
  controllers: [BoardMembersController],
  providers: [BoardMembersService],
  exports: [BoardMembersService],
})
export class BoardMembersModule {}
