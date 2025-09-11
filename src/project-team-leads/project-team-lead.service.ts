import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectTeamLead } from './entities/project-team-lead.entity';
import { CreateProjectTeamLeadDto } from './dtos/project-team-lead.dto';
import { UpdateProjectTeamLeadDto } from './dtos/project-team-lead.dto';

@Injectable()
export class ProjectTeamLeadsService {
  constructor(
    @InjectRepository(ProjectTeamLead)
    private readonly projectTeamLeadsRepository: Repository<ProjectTeamLead>,
  ) {}

  async create(createProjectTeamLeadDto: CreateProjectTeamLeadDto): Promise<ProjectTeamLead> {
    const existing = await this.projectTeamLeadsRepository.findOne({
      where: {
        projectId: createProjectTeamLeadDto.projectId,
        userId: createProjectTeamLeadDto.userId,
      },
    });

    if (existing) {
      throw new ConflictException('User is already a team lead for this project');
    }

    const teamLead = this.projectTeamLeadsRepository.create(createProjectTeamLeadDto);
    return await this.projectTeamLeadsRepository.save(teamLead);
  }

  async findAll(): Promise<ProjectTeamLead[]> {
    return this.projectTeamLeadsRepository.find({
      relations: ['project', 'user'],
      select: {
        project: {
          id: true,
          title: true,
        },
        user: {
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

  async findByProject(projectId: string): Promise<ProjectTeamLead[]> {
    return this.projectTeamLeadsRepository.find({
      where: { projectId },
      relations: ['user'],
      select: {
        user: {
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

  async findByUser(userId: string): Promise<ProjectTeamLead[]> {
    return this.projectTeamLeadsRepository.find({
      where: { userId },
      relations: ['project'],
      select: {
        project: {
          id: true,
          title: true,
        }
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findOne(projectId: string, userId: string): Promise<ProjectTeamLead> {
    const teamLead = await this.projectTeamLeadsRepository.findOne({
      where: { projectId, userId },
      relations: ['project', 'user'],
      select: {
        project: {
          id: true,
          title: true,
        },
        user: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        }
      }
    });

    if (!teamLead) {
      throw new NotFoundException('Project team lead not found');
    }

    return teamLead;
  }

  async update(
    projectId: string, 
    userId: string, 
    updateProjectTeamLeadDto: UpdateProjectTeamLeadDto
  ): Promise<ProjectTeamLead> {
    const teamLead = await this.findOne(projectId, userId);
    
    await this.projectTeamLeadsRepository.update(
      { projectId, userId },
      updateProjectTeamLeadDto
    );

    return this.findOne(projectId, userId);
  }

  async remove(projectId: string, userId: string): Promise<void> {
    const result = await this.projectTeamLeadsRepository.delete({
      projectId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Project team lead not found');
    }
  }

  async removeByProject(projectId: string): Promise<void> {
    await this.projectTeamLeadsRepository.delete({ projectId });
  }

  async removeByUser(userId: string): Promise<void> {
    await this.projectTeamLeadsRepository.delete({ userId });
  }
}