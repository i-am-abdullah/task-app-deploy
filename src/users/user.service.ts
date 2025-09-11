import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { BaseService } from 'src/common/base.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super(usersRepository, 'User');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.validateUnique('username', createUserDto.username);
    await this.validateUnique('email', createUserDto.email);

    const userData = {
      ...createUserDto,
    role: (createUserDto as any).role || 'user',
    };

    const user = await super.create(userData);
    
    const { passwordHash, ...result } = user;
    return result as User;
  }

  // Override findAll to exclude password hash and add ordering
  async findAll(): Promise<any> {
    return super.findAll({
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
  }

  // Override findOne to exclude password hash
  async findOne(id: string): Promise<any> {
    return super.findOne(id, {
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
  }

  // Custom method for authentication
  async findByEmail(email: string): Promise<User> {
    return super.findBy({ email } as any, {
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
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    if (updateUserDto.username) {
      await this.validateUnique('username', updateUserDto.username, id);
    }
    
    if (updateUserDto.email) {
      await this.validateUnique('email', updateUserDto.email, id);
    }

    const updatedUser = await super.update(id, updateUserDto);
    return updatedUser;
  }

  // Custom method for updating last login
  async updateLastLogin(id: string): Promise<void> {
    await super.update(id, {
      lastLogin: new Date()
    } as any);
  }

  // Custom method for password validation
  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  // Get users with pagination
  async findUsersWithPagination(page: number = 1, limit: number = 10) {
    return super.findAllWithPagination(
      { page, limit },
      {
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
      }
    );
  }

  // Search users by username or email
  async searchUsers(searchTerm: string): Promise<Partial<User>[]> {
    const users = await super.search(searchTerm, ['username', 'email', 'fullName']);
    
    // Remove password hash from results
    return users.map(({ passwordHash, ...user }) => user);
  }

  // Get users by role
  async findByRole(role: string): Promise<Partial<User>[]> {
    return super.findAll({
      where: { role } as any,
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
  }
}
