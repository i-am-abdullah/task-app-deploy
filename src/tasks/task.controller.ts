// src/tasks/task.controller.ts
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
import { TasksService } from './task.service';
import { CreateTaskDto } from './dtos/task.dto';
import { UpdateTaskDto } from './dtos/task.dto';
import { ResponseUtil } from 'src/utils/response';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { TaskStatus, TaskPriority } from 'src/enums';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req: RequestWithUser) {
    const task = await this.tasksService.createTask(
      createTaskDto,
      req.user.id,
      req.user.role
    );
    return ResponseUtil.created(task, 'Task created successfully');
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('listId') listId?: string,
    @Query('boardId') boardId?: string,
    @Query('projectId') projectId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('all') all?: string
  ) {
    // Enhanced search with pagination and filtering
    if (search) {
      const result = await this.tasksService.searchTasksWithPagination(
        search,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 10,
        listId,
        boardId,
        projectId,
        assignedTo
      );
      return ResponseUtil.success(result, 'Tasks retrieved successfully');
    }

    if (status) {
      const tasks = await this.tasksService.findByStatus(status);
      return ResponseUtil.success(tasks, 'Tasks retrieved successfully');
    }

    if (priority) {
      const tasks = await this.tasksService.findByPriority(priority);
      return ResponseUtil.success(tasks, 'Tasks retrieved successfully');
    }

    if (listId) {
      const tasks = await this.tasksService.findByList(listId);
      return ResponseUtil.success(tasks, 'Tasks retrieved successfully');
    }

    if (boardId) {
      const tasks = await this.tasksService.findByBoard(boardId);
      return ResponseUtil.success(tasks, 'Tasks retrieved successfully');
    }

    if (projectId) {
      const tasks = await this.tasksService.findByProject(projectId);
      return ResponseUtil.success(tasks, 'Tasks retrieved successfully');
    }

    if (assignedTo) {
      const tasks = await this.tasksService.findByAssignee(assignedTo);
      return ResponseUtil.success(tasks, 'Tasks retrieved successfully');
    }

    if (all === 'true') {
      const tasks = await this.tasksService.findAll();
      return ResponseUtil.success(tasks, 'All tasks retrieved successfully');
    }

    const result = await this.tasksService.findAllTasksWithPagination(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
    return ResponseUtil.success(result, 'Tasks retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const task = await this.tasksService.findOneTask(id, req.user.id, req.user.role);
    return ResponseUtil.success(task, 'Task retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: RequestWithUser
  ) {
    const task = await this.tasksService.updateTask(id, updateTaskDto, req.user.id, req.user.role);
    return ResponseUtil.updated(task, 'Task updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.tasksService.removeTask(id, req.user.id, req.user.role);
    return ResponseUtil.deleted('Task deleted successfully');
  }
}