import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { BaseService } from 'src/common/base.service';
import * as bcrypt from 'bcrypt';
import { ProjectTeamLead } from 'src/project-team-leads/entities/project-team-lead.entity';
import { BoardMember } from 'src/board-members/entities/board-member.entity';

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

  async findAll(options?: FindManyOptions<User>): Promise<User[]> {
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
      },
      ...options
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

  async findByRole(
    role: string,
    includeAssociations: boolean = true
  ): Promise<Partial<User>[]> {

    const queryOptions: any = {
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
    };

    // Include associations if requested
    if (includeAssociations) {
      queryOptions.relations = [
        'projectTeamLeads',
        'boardMemberships'
      ];

      // Remove specific fields from the select since we're using relations
      delete queryOptions.select;
    }

    return super.findAll(queryOptions);
  }
}
