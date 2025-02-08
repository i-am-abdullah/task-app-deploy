import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUsername = await this.usersRepository.findOne({
        where: { username: createUserDto.username }
      });
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }

      const existingEmail = await this.usersRepository.findOne({
        where: { email: createUserDto.email }
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      const user = this.usersRepository.create({
        ...createUserDto,
        role: 'user',
      });

      const savedUser = await this.usersRepository.save(user);

      const { passwordHash, ...result } = savedUser;
      return result as User;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user: ' + error.message);
    }
  }

  async findAll(): Promise<Partial<User>[]> {
    try {
      const users = await this.usersRepository.find({
        select: [
          'id',
          'username',
          'email',
          'fullName',
          'phoneNumber',
          'role',
          'lastLogin',
          'createdAt',
          'updatedAt'
        ],
        order: {
          createdAt: 'DESC'
        }
      });

      return users;
    } catch (error) {
      throw new BadRequestException('Failed to fetch users: ' + error.message);
    }
  }

  async findOne(id: string): Promise<Partial<User>> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
        select: [
          'id',
          'username',
          'email',
          'fullName',
          'phoneNumber',
          'role',
          'lastLogin',
          'createdAt',
          'updatedAt'
        ]
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user: ' + error.message);
    }
  }


  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { email },
        select: [
          'id',
          'username',
          'email',
          'passwordHash',
          'fullName',
          'phoneNumber',
          'role',
          'lastLogin'
        ]
      });

      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user: ' + error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Partial<User>> {
    try {
      await this.findOne(id);

      if (updateUserDto.username) {
        const existingUsername = await this.usersRepository.findOne({
          where: { username: updateUserDto.username }
        });
        if (existingUsername && existingUsername.id !== id) {
          throw new ConflictException('Username already exists');
        }
      }

      if (updateUserDto.email) {
        const existingEmail = await this.usersRepository.findOne({
          where: { email: updateUserDto.email }
        });
        if (existingEmail && existingEmail.id !== id) {
          throw new ConflictException('Email already exists');
        }
      }

      await this.usersRepository.update(id, updateUserDto);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user: ' + error.message);
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.usersRepository.update(id, {
        lastLogin: new Date()
      });
    } catch (error) {
      throw new BadRequestException('Failed to update last login: ' + error.message);
    }
  }


  async remove(id: string): Promise<void> {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user: ' + error.message);
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}