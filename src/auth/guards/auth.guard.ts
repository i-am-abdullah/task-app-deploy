import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  import { UsersService } from '../../users/user.service';
  import * as dayjs from 'dayjs';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private jwtService: JwtService,
      private userService: UsersService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('Token not found');
      }
  
      const user = await this.validateToken(token);
      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }
  
      request.user = user;
      const userRole = user.role;
      request.headers['user-role'] = userRole;
  
      if (this.isAdminRoute(request) && userRole !== 'admin') {
        throw new ForbiddenException('Admin access only');
      }
  
      const today = dayjs().format('YYYY-MM-DD');
      const lastActivity = user.lastLogin
        ? dayjs(user.lastLogin).format('YYYY-MM-DD')
        : null;
  
      if (lastActivity !== today) {
        await this.userService.updateLastLogin(user.id || "");
      }
  
      return true;
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  
    async validateToken(token: string) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
  
        if (!payload || !payload.sub) {
          throw new UnauthorizedException('Token payload is invalid');
        }
  
        const user = await this.userService.findOne(payload.sub);
  
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
  
        return user;
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new UnauthorizedException(error);
      }
    }
  
    private isAdminRoute(request: Request): boolean {
      const adminRoutes = ['/admin'];
      return adminRoutes.some((route) => request.url.startsWith(route));
    }
  }