import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Like } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dtos/project.dto';
import { UpdateProjectDto } from './dtos/project.dto';
import { BaseService } from 'src/common/base.service';
import { UserRole, ProjectStatus } from 'src/enums';
import { WorkspacesService } from 'src/workspaces/workspace.service';

@Injectable()
export class ProjectsService extends BaseService<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    private readonly workspacesService: WorkspacesService,
  ) {
    super(projectsRepository, 'Project');
  }

  async createProject(createProjectDto: CreateProjectDto, userId: string, userRole: string): Promise<Project> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create projects');
    }

    // Validate workspace exists
    await this.workspacesService.findOne(createProjectDto.workspaceId);

    const projectData = {
      ...createProjectDto,
      createdBy: userId,
    };

    return super.create(projectData);
  }

  async findAll(): Promise<Project[]> {
    return super.findAll({
      relations: ['workspace', 'creator'],
      select: {
        workspace: {
          id: true,
          name: true,
        },
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

  async findAllProjectsWithPagination(page: number = 1, limit: number = 10) {
    return super.findAllWithPagination(
      { page, limit },
      {
        relations: ['workspace', 'creator'],
        select: {
          workspace: {
            id: true,
            name: true,
          },
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

  async findOne(id: string): Promise<Project> {
    return super.findOne(id, {
      relations: ['workspace', 'creator', 'boards', 'teamLeads', 'teamLeads.user'],
      select: {
        workspace: {
          id: true,
          name: true,
        },
        creator: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        },
        teamLeads: {
          id: true,
          role: true,
          createdAt: true,
          user: {
            id: true,
            username: true,
            email: true,
            fullName: true,
          }
        }
      }
    });
  }

  async updateProject(id: string, updateProjectDto: UpdateProjectDto, userRole: string): Promise<Project> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update projects');
    }

    return super.update(id, updateProjectDto);
  }

  async removeProject(id: string, userRole: string): Promise<void> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete projects');
    }

    return super.remove(id);
  }

  // Original search method (keeping for backward compatibility)
  async searchProjects(searchTerm: string): Promise<Project[]> {
    const projects = await super.search(searchTerm, ['title']);

    const projectIds = projects.map(p => p.id);
    if (!projectIds || projectIds.length === 0) return [];

    return this.projectsRepository.find({
      where: { id: In(projectIds) },
      relations: ['workspace', 'creator'],
      select: {
        workspace: {
          id: true,
          name: true,
        },
        creator: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        }
      }
    });
  }

  async searchProjectsWithPagination(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
    workspaceId?: string
  ) {
    const skip = (page - 1) * limit;
    
    const whereConditions: any = {
      title: Like(`%${searchTerm}%`)
    };
    
    if (workspaceId) {
      whereConditions.workspaceId = workspaceId;
    }

    const total = await this.projectsRepository.count({
      where: whereConditions
    });

    const projects = await this.projectsRepository.find({
      where: whereConditions,
      relations: ['workspace', 'creator'],
      select: {
        workspace: {
          id: true,
          name: true,
        },
        creator: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        }
      },
      order: {
        createdAt: 'DESC'
      },
      skip,
      take: limit
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    return super.findAll({
      where: { status },
      relations: ['workspace', 'creator'],
      select: {
        workspace: {
          id: true,
          name: true,
        },
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

  async findByWorkspace(workspaceId: string): Promise<Project[]> {
    return super.findAll({
      where: { workspaceId },
      relations: ['workspace', 'creator'],
      select: {
        workspace: {
          id: true,
          name: true,
        },
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
}