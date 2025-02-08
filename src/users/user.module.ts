import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
  JwtModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export for use in other modules
})
export class UsersModule {}