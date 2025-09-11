import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards
} from '@nestjs/common';
import { ProjectTeamLeadsService } from './project-team-lead.service';
import { CreateProjectTeamLeadDto } from './dtos/project-team-lead.dto';
import { UpdateProjectTeamLeadDto } from './dtos/project-team-lead.dto';
import { ResponseUtil } from 'src/utils/response';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('project-team-leads')
@UseGuards(AuthGuard)
export class ProjectTeamLeadsController {
  constructor(private readonly projectTeamLeadsService: ProjectTeamLeadsService) {}

  @Post()
  async create(@Body() createProjectTeamLeadDto: CreateProjectTeamLeadDto) {
    const teamLead = await this.projectTeamLeadsService.create(createProjectTeamLeadDto);
    return ResponseUtil.created(teamLead, 'Team lead assigned successfully');
  }

  @Get()
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string
  ) {
    if (projectId) {
      const teamLeads = await this.projectTeamLeadsService.findByProject(projectId);
      return ResponseUtil.success(teamLeads, 'Project team leads retrieved successfully');
    }

    if (userId) {
      const teamLeads = await this.projectTeamLeadsService.findByUser(userId);
      return ResponseUtil.success(teamLeads, 'User team lead assignments retrieved successfully');
    }

    const teamLeads = await this.projectTeamLeadsService.findAll();
    return ResponseUtil.success(teamLeads, 'All team lead assignments retrieved successfully');
  }

  @Get(':projectId/:userId')
  async findOne(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string
  ) {
    const teamLead = await this.projectTeamLeadsService.findOne(projectId, userId);
    return ResponseUtil.success(teamLead, 'Team lead assignment retrieved successfully');
  }

  @Patch(':projectId/:userId')
  async update(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() updateProjectTeamLeadDto: UpdateProjectTeamLeadDto
  ) {
    const teamLead = await this.projectTeamLeadsService.update(
      projectId, 
      userId, 
      updateProjectTeamLeadDto
    );
    return ResponseUtil.updated(teamLead, 'Team lead assignment updated successfully');
  }

  @Delete(':projectId/:userId')
  async remove(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string
  ) {
    await this.projectTeamLeadsService.remove(projectId, userId);
    return ResponseUtil.deleted('Team lead assignment removed successfully');
  }
}