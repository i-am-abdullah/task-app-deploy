// src/task-assignees/task-assignee.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TaskAssignee } from './entities/task-assignee.entity';
import { BaseService } from 'src/common/base.service';
import { CreateTaskAssigneeDto, CreateBulkTaskAssigneesDto, UpdateTaskAssigneeDto } from './dtos/task-assignee.dto';
import { TasksService } from 'src/tasks/task.service';
import { UsersService } from 'src/users/user.service';
import { RBACService } from 'src/common/rbac.service';

@Injectable()
export class TaskAssigneeService extends BaseService<TaskAssignee> {
  constructor(
    @InjectRepository(TaskAssignee)
    private readonly taskAssigneeRepository: Repository<TaskAssignee>,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
    private readonly rbacService: RBACService,
  ) {
    super(taskAssigneeRepository, 'TaskAssignee');
  }
  
  async createTaskAssignee(
    createTaskAssigneeDto: CreateTaskAssigneeDto, 
    assignedBy: string,
    assignerRole: string
  ): Promise<TaskAssignee> {
    const task = await this.tasksService.findOneTask(createTaskAssigneeDto.taskId);
    
    // Check RBAC access
    await this.rbacService.validateEntityAccess(assignedBy, assignerRole, {
      projectId: task.projectId,
      boardId: task.boardId
    }, 'write');

    // Validate user exists
    await this.usersService.findOne(createTaskAssigneeDto.userId);

    // Check if assignment already exists
    const existingAssignment = await this.findByOptional({
      taskId: createTaskAssigneeDto.taskId,
      userId: createTaskAssigneeDto.userId
    });

    if (existingAssignment) {
      throw new ConflictException('User is already assigned to this task');
    }

    const assigneeData = {
      ...createTaskAssigneeDto,
      assignedBy,
    };

    return super.create(assigneeData);
  }

  async createBulkTaskAssignees(
    createBulkDto: CreateBulkTaskAssigneesDto,
    assignedBy: string,
    assignerRole: string
  ): Promise<TaskAssignee[]> {
    // Validate task exists and get access info
    const task = await this.tasksService.findOneTask(createBulkDto.taskId);
    
    // Check RBAC access
    await this.rbacService.validateEntityAccess(assignedBy, assignerRole, {
      projectId: task.projectId,
      boardId: task.boardId
    }, 'write');

    // Validate all users exist
    const users = await this.usersService.findAll({
      where: { id: In(createBulkDto.userIds) }
    });

    if (users.length !== createBulkDto.userIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    // Check for existing assignments
    const existingAssignments = await this.findAll({
      where: {
        taskId: createBulkDto.taskId,
        userId: In(createBulkDto.userIds)
      }
    });

    if (existingAssignments.length > 0) {
      const existingUserIds = existingAssignments.map(a => a.userId);
      throw new ConflictException(
        `Users ${existingUserIds.join(', ')} are already assigned to this task`
      );
    }

    // Create assignments
    const assigneeData = createBulkDto.userIds.map(userId => ({
      taskId: createBulkDto.taskId,
      userId,
      assignedBy,
      metadata: createBulkDto.metadata,
    }));

    return super.createMany(assigneeData);
  }

  async assignUsersToTask(
    taskId: string,
    userIds: string[],
    assignedBy: string,
    assignerRole: string,
    metadata?: Record<string, any>
  ): Promise<TaskAssignee[]> {
    return this.createBulkTaskAssignees(
      { taskId, userIds, metadata },
      assignedBy,
      assignerRole
    );
  }

  async removeUsersFromTask(
    taskId: string,
    userIds: string[],
    removedBy: string,
    removerRole: string
  ): Promise<void> {
    // Validate task exists and get access info
    const task = await this.tasksService.findOneTask(taskId);
    
    // Check RBAC access
    await this.rbacService.validateEntityAccess(removedBy, removerRole, {
      projectId: task.projectId,
      boardId: task.boardId
    }, 'write');

    // Find existing assignments
    const assignments = await this.findAll({
      where: {
        taskId,
        userId: In(userIds)
      }
    });

    if (assignments.length === 0) {
      throw new NotFoundException('No assignments found for the specified users');
    }

    // Remove assignments
    const assignmentIds = assignments.map(a => a.id);
    await this.taskAssigneeRepository.delete({ id: In(assignmentIds) });
  }

  async findTaskAssignees(taskId: string): Promise<TaskAssignee[]> {
    return this.findAll({
      where: { taskId },
      relations: ['user', 'assigner'],
      select: {
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
  }

  async findUserTasks(userId: string): Promise<TaskAssignee[]> {
    return this.findAll({
      where: { userId },
      relations: ['task', 'task.project', 'task.board', 'task.list'],
      select: {
        task: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          completedAt: true,
          project: {
            id: true,
            title: true,
          },
          board: {
            id: true,
            title: true,
          },
          list: {
            id: true,
            title: true,
          }
        }
      },
      order: {
        assignedAt: 'DESC'
      }
    });
  }

  async updateTaskAssignee(
    id: string,
    updateDto: UpdateTaskAssigneeDto,
    updatedBy: string,
    updaterRole: string
  ): Promise<TaskAssignee> {
    const assignment = await this.findOne(id, { relations: ['task'] });
    
    // Check RBAC access
    await this.rbacService.validateEntityAccess(updatedBy, updaterRole, {
      projectId: assignment.task.projectId,
      boardId: assignment.task.boardId
    }, 'write');

    return super.update(id, updateDto);
  }

  async removeTaskAssignee(
    id: string,
    removedBy: string,
    removerRole: string
  ): Promise<void> {
    const assignment = await this.findOne(id, { relations: ['task'] });
    
    // Check RBAC access
    await this.rbacService.validateEntityAccess(removedBy, removerRole, {
      projectId: assignment.task.projectId,
      boardId: assignment.task.boardId
    }, 'delete');

    return super.remove(id);
  }

  async isUserAssignedToTask(taskId: string, userId: string): Promise<boolean> {
    const assignment = await this.findByOptional({ taskId, userId });
    return !!assignment;
  }

  async getTaskAssigneeCount(taskId: string): Promise<number> {
    return this.count({ where: { taskId } });
  }

  async reassignTask(
    taskId: string,
    fromUserId: string,
    toUserId: string,
    reassignedBy: string,
    reassignerRole: string
  ): Promise<TaskAssignee> {
    // Validate task exists and get access info
    const task = await this.tasksService.findOneTask(taskId);
    
    // Check RBAC access
    await this.rbacService.validateEntityAccess(reassignedBy, reassignerRole, {
      projectId: task.projectId,
      boardId: task.boardId
    }, 'write');

    // Find existing assignment
    const existingAssignment = await this.findBy({ taskId, userId: fromUserId });

    // Check if new user is already assigned
    const newUserAssignment = await this.findByOptional({ taskId, userId: toUserId });
    if (newUserAssignment) {
      throw new ConflictException('Target user is already assigned to this task');
    }

    // Validate new user exists
    await this.usersService.findOne(toUserId);

    // Update the assignment
    return super.update(existingAssignment.id, {
      userId: toUserId,
      assignedBy: reassignedBy,
      assignedAt: new Date(),
    });
  }
}