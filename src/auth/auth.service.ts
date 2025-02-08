import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import * as bcrypt from 'bcrypt';
  import { UsersService } from '../users/user.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
    ) {}
  
    async register(
      registerDto: RegisterDto,
    ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
      const { username, email, password, fullName, phoneNumber } = registerDto;

  
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({
        username,
        email,
        passwordHash,
        fullName: fullName,
        phoneNumber
      });
  
      const payload = { email: user.email, sub: user.id, role: user.role };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      });
  
      return { accessToken, refreshToken, user };
    }
  
    async login(
      loginDto: LoginDto,
    ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
      const { email, password } = loginDto;
  
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      const isPasswordValid = await this.usersService.validatePassword(
        user,
        password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
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
  