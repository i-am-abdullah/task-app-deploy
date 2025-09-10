import { 
  NotFoundException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';
import { 
  Repository, 
  FindOneOptions, 
  FindManyOptions, 
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseService<T extends ObjectLiteral> {
  protected repository: Repository<T>;
  protected entityName: string;

  constructor(repository: Repository<T>, entityName: string) {
    this.repository = repository;
    this.entityName = entityName;
  }

  async create(createDto: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(createDto);
      return await this.repository.save(entity);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException(`${this.entityName} already exists`);
      }
      throw new BadRequestException(`Failed to create ${this.entityName.toLowerCase()}: ${error.message}`);
    }
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    try {
      return await this.repository.find(options);
    } catch (error) {
      throw new BadRequestException(`Failed to fetch ${this.entityName.toLowerCase()}s: ${error.message}`);
    }
  }

  async findAllWithPagination(
    paginationOptions: PaginationOptions,
    findOptions?: FindManyOptions<T>
  ): Promise<PaginationResult<T>> {
    try {
      const { page = 1, limit = 10 } = paginationOptions;
      const skip = (page - 1) * limit;

      const [data, total] = await this.repository.findAndCount({
        ...findOptions,
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch ${this.entityName.toLowerCase()}s: ${error.message}`);
    }
  }

  async findOne(id: string | number, options?: FindOneOptions<T>): Promise<T> {
    try {
      const entity = await this.repository.findOne({
        where: { id } as unknown as FindOptionsWhere<T>,
        ...options,
      });

      if (!entity) {
        throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
      }

      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch ${this.entityName.toLowerCase()}: ${error.message}`);
    }
  }

  async findBy(where: FindOptionsWhere<T>, options?: FindOneOptions<T>): Promise<T> {
    try {
      const entity = await this.repository.findOne({
        where,
        ...options,
      });

      if (!entity) {
        throw new NotFoundException(`${this.entityName} not found`);
      }

      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch ${this.entityName.toLowerCase()}: ${error.message}`);
    }
  }

  async findByOptional(where: FindOptionsWhere<T>, options?: FindOneOptions<T>): Promise<T | null> {
    try {
      return await this.repository.findOne({
        where,
        ...options,
      });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch ${this.entityName.toLowerCase()}: ${error.message}`);
    }
  }

  async update(id: string | number, updateDto: DeepPartial<T>): Promise<T> {
    try {
      const entity = await this.findOne(id);

      await this.repository.update(id, updateDto as QueryDeepPartialEntity<T>);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException(`${this.entityName} with provided data already exists`);
      }
      throw new BadRequestException(`Failed to update ${this.entityName.toLowerCase()}: ${error.message}`);
    }
  }

  async remove(id: string | number): Promise<void> {
    try {
      const result = await this.repository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete ${this.entityName.toLowerCase()}: ${error.message}`);
    }
  }

  async softRemove(id: string | number): Promise<T> {
    try {
      const entity = await this.findOne(id);
      return await this.repository.softRemove(entity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to soft delete ${this.entityName.toLowerCase()}: ${error.message}`);
    }
  }

  async restore(id: string | number): Promise<T> {
    try {
      await this.repository.restore(id);
      return await this.findOne(id);
    } catch (error) {
      throw new BadRequestException(`Failed to restore ${this.entityName.toLowerCase()}: ${error.message}`);
    }
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    try {
      return await this.repository.count(options);
    } catch (error) {
      throw new BadRequestException(`Failed to count ${this.entityName.toLowerCase()}s: ${error.message}`);
    }
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    try {
      const count = await this.repository.count({ where });
      return count > 0;
    } catch (error) {
      throw new BadRequestException(`Failed to check if ${this.entityName.toLowerCase()} exists: ${error.message}`);
    }
  }

  // Protected method for custom validation in child services
  protected async validateUnique(
    field: keyof T, 
    value: any, 
    excludeId?: string | number
  ): Promise<void> {
    const where = { [field]: value } as FindOptionsWhere<T>;
    const existing = await this.findByOptional(where);
    
    if (existing && (!excludeId || existing['id'] !== excludeId)) {
      throw new ConflictException(`${String(field)} already exists`);
    }
  }

  // Method to get repository instance for complex queries
  getRepository(): Repository<T> {
    return this.repository;
  }

  // Additional utility methods
  async findAllWithDeleted(): Promise<T[]> {
    try {
      return await this.repository.find({ withDeleted: true } as FindManyOptions<T>);
    } catch (error) {
      throw new BadRequestException(`Failed to fetch ${this.entityName.toLowerCase()}s with deleted: ${error.message}`);
    }
  }

  async createMany(createDtos: DeepPartial<T>[]): Promise<T[]> {
    try {
      const entities = this.repository.create(createDtos);
      return await this.repository.save(entities);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(`One or more ${this.entityName.toLowerCase()}s already exist`);
      }
      throw new BadRequestException(`Failed to create multiple ${this.entityName.toLowerCase()}s: ${error.message}`);
    }
  }

  async search(searchTerm: string, searchFields: (keyof T)[]): Promise<T[]> {
    try {
      const query = this.repository.createQueryBuilder('entity');
      
      searchFields.forEach((field, index) => {
        const condition = `entity.${String(field)} ILIKE :searchTerm`;
        if (index === 0) {
          query.where(condition, { searchTerm: `%${searchTerm}%` });
        } else {
          query.orWhere(condition, { searchTerm: `%${searchTerm}%` });
        }
      });
      
      return await query.getMany();
    } catch (error) {
      throw new BadRequestException(`Failed to search ${this.entityName.toLowerCase()}s: ${error.message}`);
    }
  }
}