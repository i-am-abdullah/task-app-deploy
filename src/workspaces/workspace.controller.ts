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
import { WorkspacesService } from './workspace.service';
import { CreateWorkspaceDto } from './dtos/workspace.dto';
import { UpdateWorkspaceDto } from './dtos/workspace.dto';
import { ResponseUtil } from 'src/utils/response';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Request() req:RequestWithUser) {
    const workspace = await this.workspacesService.createWorkspace(
      createWorkspaceDto, 
      req.user.id, 
      req.user.role
    );
    return ResponseUtil.created(workspace, 'Workspace created successfully');
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('all') all?: string
  ) {
    if (search) {
      const workspaces = await this.workspacesService.searchWorkspaces(search);
      console.log(workspaces);
      
      return ResponseUtil.success(workspaces, 'Workspaces retrieved successfully');
    }

    if (all === 'true') {
      const workspaces = await this.workspacesService.findAll();
      return ResponseUtil.success(workspaces, 'All workspaces retrieved successfully');
    }

    const result = await this.workspacesService.findAllWorkspacesWithPagination(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
    return ResponseUtil.success(result, 'Workspaces retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const workspace = await this.workspacesService.findOne(id);
    return ResponseUtil.success(workspace, 'Workspace retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Request() req:RequestWithUser
  ) {
    const workspace = await this.workspacesService.updateWorkspace(id, updateWorkspaceDto, req.user.role);
    return ResponseUtil.updated(workspace, 'Workspace updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.workspacesService.removeWorkspace(id, req.user.role);
    return ResponseUtil.deleted('Workspace deleted successfully');
  }
}