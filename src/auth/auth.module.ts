import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/user.module';
import { AuthGuard } from './guards/auth.guard';
import { ProjectsModule } from 'src/projects/project.module';
import { ProjectTeamLeadsModule } from 'src/project-team-leads/project-team-lead.module';
import { BoardsModule } from 'src/boards/board.module';
import { BoardMembersModule } from 'src/board-members/board-member.module';

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    ProjectTeamLeadsModule,
    BoardsModule,
    BoardMembersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService]
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}