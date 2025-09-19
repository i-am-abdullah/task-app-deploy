// src/task-assignees/task-assignee.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query
} from '@nestjs/common';
import { TaskAssigneeService } from './task-assignee.service';
import {
  CreateTaskAssigneeDto,
  CreateBulkTaskAssigneesDto,
  UpdateTaskAssigneeDto,
  AssignUsersToTaskDto,
  RemoveUsersFromTaskDto
} from './dtos/task-assignee.dto';
import { ResponseUtil } from 'src/utils/response';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@Controller('task-assignees')
@UseGuards(AuthGuard)
export class TaskAssigneeController {
  constructor(private readonly taskAssigneeService: TaskAssigneeService) {}

  @Post()
  async create(
    @Body() createTaskAssigneeDto: CreateTaskAssigneeDto,
    @Request() req: RequestWithUser
  ) {
    const assignment = await this.taskAssigneeService.createTaskAssignee(
      createTaskAssigneeDto,
      req.user.id,
      req.user.role
    );
    return ResponseUtil.created(assignment, 'Task assignee created successfully');
  }

  @Post('bulk')
  async createBulk(
    @Body() createBulkDto: CreateBulkTaskAssigneesDto,
    @Request() req: RequestWithUser
  ) {
    const assignments = await this.taskAssigneeService.createBulkTaskAssignees(
      createBulkDto,
      req.user.id,
      req.user.role
    );
    return ResponseUtil.created(assignments, 'Task assignees created successfully');
  }

  @Post('tasks/:taskId/assign')
  async assignUsersToTask(
    @Param('taskId') taskId: string,
    @Body() assignUsersDto: AssignUsersToTaskDto,
    @Request() req: RequestWithUser
  ) {
    const assignments = await this.taskAssigneeService.assignUsersToTask(
      taskId,
      assignUsersDto.userIds,
      req.user.id,
      req.user.role,
      assignUsersDto.metadata
    );
    return ResponseUtil.created(assignments, 'Users assigned to task successfully');
  }

  @Delete('tasks/:taskId/unassign')
  async removeUsersFromTask(
    @Param('taskId') taskId: string,
    @Body() removeUsersDto: RemoveUsersFromTaskDto,
    @Request() req: RequestWithUser
  ) {
    await this.taskAssigneeService.removeUsersFromTask(
      taskId,
      removeUsersDto.userIds,
      req.user.id,
      req.user.role
    );
    return ResponseUtil.deleted('Users removed from task successfully');
  }

  @Post('tasks/:taskId/reassign/:fromUserId/:toUserId')
  async reassignTask(
    @Param('taskId') taskId: string,
    @Param('fromUserId') fromUserId: string,
    @Param('toUserId') toUserId: string,
    @Request() req: RequestWithUser
  ) {
    const assignment = await this.taskAssigneeService.reassignTask(
      taskId,
      fromUserId,
      toUserId,
      req.user.id,
      req.user.role
    );
    return ResponseUtil.updated(assignment, 'Task reassigned successfully');
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('taskId') taskId?: string,
    @Query('userId') userId?: string
  ) {
    if (taskId) {
      const assignments = await this.taskAssigneeService.findTaskAssignees(taskId);
      return ResponseUtil.success(assignments, 'Task assignees retrieved successfully');
    }

    if (userId) {
      const assignments = await this.taskAssigneeService.findUserTasks(userId);
      return ResponseUtil.success(assignments, 'User task assignments retrieved successfully');
    }

    const result = await this.taskAssigneeService.findAllWithPagination({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10
    }, {
      relations: ['task', 'user', 'assigner'],
      select: {
        task: {
          id: true,
          title: true,
          status: true,
          priority: true,
        },
        user: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        },
        assigner: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        }
      },
      order: {
        assignedAt: 'DESC'
      }
    });

    return ResponseUtil.success(result, 'Task assignees retrieved successfully');
  }

  @Get('tasks/:taskId')
  async findTaskAssignees(@Param('taskId') taskId: string) {
    const assignments = await this.taskAssigneeService.findTaskAssignees(taskId);
    return ResponseUtil.success(assignments, 'Task assignees retrieved successfully');
  }

  @Get('users/:userId/tasks')
  async findUserTasks(@Param('userId') userId: string) {
    const assignments = await this.taskAssigneeService.findUserTasks(userId);
    return ResponseUtil.success(assignments, 'User task assignments retrieved successfully');
  }

  @Get('tasks/:taskId/count')
  async getTaskAssigneeCount(@Param('taskId') taskId: string) {
    const count = await this.taskAssigneeService.getTaskAssigneeCount(taskId);
    return ResponseUtil.success({ count }, 'Task assignee count retrieved successfully');
  }

  @Get('tasks/:taskId/users/:userId/check')
  async checkUserAssignment(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string
  ) {
    const isAssigned = await this.taskAssigneeService.isUserAssignedToTask(taskId, userId);
    return ResponseUtil.success({ isAssigned }, 'Assignment check completed');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const assignment = await this.taskAssigneeService.findOne(id, {
      relations: ['task', 'user', 'assigner'],
      select: {
        task: {
          id: true,
          title: true,
          status: true,
          priority: true,
        },
        user: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        },
        assigner: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        }
      }
    });
    return ResponseUtil.success(assignment, 'Task assignee retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskAssigneeDto: UpdateTaskAssigneeDto,
    @Request() req: RequestWithUser
  ) {
    const assignment = await this.taskAssigneeService.updateTaskAssignee(
      id,
      updateTaskAssigneeDto,
      req.user.id,
      req.user.role
    );
    return ResponseUtil.updated(assignment, 'Task assignee updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.taskAssigneeService.removeTaskAssignee(id, req.user.id, req.user.role);
    return ResponseUtil.deleted('Task assignee deleted successfully');
  }
}