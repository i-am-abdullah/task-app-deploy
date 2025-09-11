import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  Request,
  UseGuards
} from '@nestjs/common';
import { ProjectsService } from './project.service';
import { CreateProjectDto } from './dtos/project.dto';
import { UpdateProjectDto } from './dtos/project.dto';
import { ResponseUtil } from 'src/utils/response';
import { ProjectStatus } from 'src/enums';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req:RequestWithUser) {
    const project = await this.projectsService.createProject(
      createProjectDto, 
      req.user.id, 
      req.user.role
    );
    return ResponseUtil.created(project, 'Project created successfully');
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: ProjectStatus,
    @Query('workspaceId') workspaceId?: string,
    @Query('all') all?: string
  ) {
    if (search) {
      const projects = await this.projectsService.searchProjects(search);
      return ResponseUtil.success(projects, 'Projects retrieved successfully');
    }

    if (status) {
      const projects = await this.projectsService.findByStatus(status);
      return ResponseUtil.success(projects, 'Projects retrieved successfully');
    }

    if (workspaceId) {
      const projects = await this.projectsService.findByWorkspace(workspaceId);
      return ResponseUtil.success(projects, 'Projects retrieved successfully');
    }

    if (all === 'true') {
      const projects = await this.projectsService.findAll();
      return ResponseUtil.success(projects, 'All projects retrieved successfully');
    }

    const result = await this.projectsService.findAllProjectsWithPagination(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
    return ResponseUtil.success(result, 'Projects retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    return ResponseUtil.success(project, 'Project retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req:RequestWithUser
  ) {
    const project = await this.projectsService.updateProject(id, updateProjectDto, req.user.role);
    return ResponseUtil.updated(project, 'Project updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.projectsService.removeProject(id, req.user.role);
    return ResponseUtil.deleted('Project deleted successfully');
  }
}