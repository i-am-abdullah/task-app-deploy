import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { ProjectsService } from 'src/projects/project.service';
import { BoardsService } from 'src/boards/board.service';
import { ProjectTeamLeadsService } from 'src/project-team-leads/project-team-lead.service';
import { BoardMembersService } from 'src/board-members/board-member.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly projectsService: ProjectsService,
    private readonly boardsService: BoardsService,
    private readonly projectTeamLeadsService: ProjectTeamLeadsService,
    private readonly boardMembersService: BoardMembersService,
  ) { }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const { username, email, password, fullName, phoneNumber, projectId, boardId, adminKey } = registerDto;

    // Validate exactly one of projectId | boardId | adminKey present
    const provided = [projectId ? 1 : 0, boardId ? 1 : 0, adminKey ? 1 : 0].reduce((a, b) => a + b, 0);
    if (provided === 0) {
      throw new BadRequestException('One of projectId, boardId or adminKey must be provided');
    }
    if (provided > 1) {
      throw new BadRequestException('Only one of projectId, boardId or adminKey can be provided');
    }

    // Determine role from provided value
    let role: string;
    if (projectId) role = 'team_lead';
    else if (boardId) role = 'user';
    else if (adminKey) role = 'admin';
    else throw new BadRequestException('Invalid registration payload');

    // If adminKey path, validate env ADMIN_KEY
    if (adminKey) {
      const expected = this.configService.get<string>('ADMIN_KEY');
      if (!expected || adminKey !== expected) {
        throw new UnauthorizedException('Invalid admin key');
      }
    }

    // If projectId provided, verify project exists BEFORE creating user
    if (projectId) {
      try {
        await this.projectsService.findOne(projectId);
      } catch (err) {
        // ProjectsService.findOne throws NotFoundException — translate to BadRequest here
        throw new BadRequestException('Invalid projectId provided');
      }
    }

    // If boardId provided, verify board exists BEFORE creating user
    if (boardId) {
      try {
        await this.boardsService.findOne(boardId);
      } catch (err) {
        throw new BadRequestException('Invalid boardId provided');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with resolved role
    let createdUser: any;
    try {
      createdUser = await this.usersService.create({
        username,
        email,
        passwordHash,
        fullName,
        phoneNumber,
        role, // pass computed role
      } as any);
    } catch (err) {
      // rethrow so controller handles responses consistently
      throw err;
    }

    // If projectId or boardId provided, attempt to associate user.
    // If association fails, delete created user (rollback) and rethrow error.
    try {
      if (projectId) {
        // create project team lead entry
        await this.projectTeamLeadsService.create({
          projectId,
          userId: createdUser.id,
        } as any);
      } else if (boardId) {
        // create board member entry
        await this.boardMembersService.create({
          boardId,
          userId: createdUser.id,
        } as any);
      }
    } catch (assocErr) {
      // rollback created user
      try {
        await this.usersService.remove(createdUser.id);
      } catch (deleteErr) {
        // if rollback fails, throw an internal error
        throw new InternalServerErrorException('Failed to rollback user after association failure');
      }
      // rethrow original association error to client
      throw assocErr;
    }

    // generate tokens and return user (usersService.create already strips passwordHash)
    const payload = { email: createdUser.email, sub: createdUser.id, role: createdUser.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken, user: createdUser };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    await this.usersService.updateLastLogin(user.id);

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken, user };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const payload = {
        email: decoded.email,
        sub: decoded.sub,
        role: decoded.role,
      };

      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateToken(accessToken: string): Promise<{ valid: boolean; payload?: any }> {
    try {
      const payload = this.jwtService.verify(accessToken); // Verify token using JWT secret
      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }
}
