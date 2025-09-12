import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dtos/workspace.dto';
import { UpdateWorkspaceDto } from './dtos/workspace.dto';
import { BaseService } from 'src/common/base.service';
import { UserRole } from 'src/enums';

@Injectable()
export class WorkspacesService extends BaseService<Workspace> {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspacesRepository: Repository<Workspace>,
  ) {
    super(workspacesRepository, 'Workspace');
  }

  async createWorkspace(createWorkspaceDto: CreateWorkspaceDto, userId: string, userRole: string): Promise<Workspace> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create workspaces');
    }

    const workspaceData = {
      ...createWorkspaceDto,
      createdBy: userId,
    };

    return super.create(workspaceData);
  }

  async findAll(): Promise<Workspace[]> {
    return super.findAll({
      relations: ['creator'],
      select: {
        creator: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        }
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findAllWorkspacesWithPagination(page: number = 1, limit: number = 10) {
    return super.findAllWithPagination(
      { page, limit },
      {
        relations: ['creator'],
        select: {
          creator: {
            id: true,
            username: true,
            email: true,
            fullName: true,
          }
        },
        order: {
          createdAt: 'DESC'
        }
      }
    );
  }

  async findOne(id: string): Promise<Workspace> {
    return super.findOne(id, {
      relations: ['creator', 'projects'],
      select: {
        creator: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        }
      }
    });
  }

  async updateWorkspace(id: string, updateWorkspaceDto: UpdateWorkspaceDto, userRole: string): Promise<Workspace> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update workspaces');
    }

    return super.update(id, updateWorkspaceDto);
  }

  async removeWorkspace(id: string, userRole: string): Promise<void> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete workspaces');
    }

    return super.remove(id);
  }

async searchWorkspaces(searchTerm: string): Promise<Workspace[]> {
    const workspaces = await super.search(searchTerm, ['name']);

    const workspaceIds = workspaces.map(w => w.id);
    if (!workspaceIds || workspaceIds.length === 0) return [];

    return this.workspacesRepository.find({
      where: { id: In(workspaceIds) },
      relations: ['creator'],
      select: {
        creator: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        }
      }
    });
}
}