// src/tasks/task.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { UpdateTaskDto } from './dtos/task.dto';
import { CreateTaskDto } from './dtos/task.dto';
import { BaseService } from 'src/common/base.service';
import { TaskStatus, TaskPriority } from 'src/enums';
import { ListsService } from 'src/lists/list.service';
import { RBACService } from 'src/common/rbac.service';

@Injectable()
export class TasksService extends BaseService<Task> {
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
        private readonly listsService: ListsService,
        private readonly rbacService: RBACService,
    ) {
        super(tasksRepository, 'Task');
    }

    async createTask(createTaskDto: CreateTaskDto, userId: string, userRole: string): Promise<Task> {
        // Validate list exists and get project/board info
        const list = await this.listsService.findOne(createTaskDto.listId);
        console.log(list);
        
        // Check RBAC access
        await this.rbacService.validateEntityAccess(userId, userRole, {
            projectId: list.projectId,
            boardId: list.boardId
        }, 'write');

        const taskData:any = {
            ...createTaskDto,
            createdBy: userId,
            dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
            projectId: list.projectId,
            boardId: list.boardId,
        };

        return super.create(taskData);
    }

    async findAll(): Promise<Task[]> {
        return super.findAll({
            relations: ['project', 'board', 'list', 'creator', 'assignee'],
            select: {
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
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                assignee: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                }
            },
            order: {
                position: 'ASC',
                createdAt: 'DESC'
            }
        });
    }

    async findAllTasksWithPagination(page: number = 1, limit: number = 10) {
        return super.findAllWithPagination(
            { page, limit },
            {
                relations: ['project', 'board', 'list', 'creator', 'assignee'],
                select: {
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
                    },
                    creator: {
                        id: true,
                        username: true,
                        email: true,
                        fullName: true,
                    },
                    assignee: {
                        id: true,
                        username: true,
                        email: true,
                        fullName: true,
                    }
                },
                order: {
                    position: 'ASC',
                    createdAt: 'DESC'
                }
            }
        );
    }

    async findOneTask(id: string, userId?: string, userRole?: string): Promise<Task> {
        const task = await super.findOne(id, {
            relations: ['project', 'board', 'list', 'creator', 'assignee'],
            select: {
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
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                assignee: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                }
            }
        });

        // Check RBAC access if user info provided
        if (userId && userRole) {
            await this.rbacService.validateEntityAccess(userId, userRole, {
                projectId: task.projectId,
                boardId: task.boardId
            }, 'read');
        }

        return task;
    }

    async updateTask(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: string): Promise<Task> {
        const task = await this.findOne(id);
        
        // Check RBAC access
        await this.rbacService.validateEntityAccess(userId, userRole, {
            projectId: task.projectId,
            boardId: task.boardId
        }, 'write');

        const updateData = {
            ...updateTaskDto,
            dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
            completedAt: updateTaskDto.status === TaskStatus.DONE ? new Date() : undefined,
        };

        return super.update(id, updateData);
    }

    async removeTask(id: string, userId: string, userRole: string): Promise<void> {
        const task = await this.findOne(id);
        
        // Check RBAC access
        await this.rbacService.validateEntityAccess(userId, userRole, {
            projectId: task.projectId,
            boardId: task.boardId
        }, 'delete');

        return super.remove(id);
    }

    async searchTasks(searchTerm: string): Promise<Task[]> {
        const tasks = await super.search(searchTerm, ['title', 'description']);

        const taskIds = tasks.map(t => t.id);
        if (!taskIds || taskIds.length === 0) return [];

        return this.tasksRepository.find({
            where: { id: In(taskIds) },
            relations: ['project', 'board', 'list', 'creator', 'assignee'],
            select: {
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
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                assignee: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                }
            }
        });
    }

    async searchTasksWithPagination(
        searchTerm: string,
        page: number = 1,
        limit: number = 10,
        listId?: string,
        boardId?: string,
        projectId?: string,
        assignedTo?: string
    ) {
        const skip = (page - 1) * limit;

        const whereConditions: any = [
            { title: Like(`%${searchTerm}%`) },
            { description: Like(`%${searchTerm}%`) }
        ];

        // Add filters
        const additionalFilters: any = {};
        if (listId) additionalFilters.listId = listId;
        if (boardId) additionalFilters.boardId = boardId;
        if (projectId) additionalFilters.projectId = projectId;
        if (assignedTo) additionalFilters.assignedTo = assignedTo;

        // Apply additional filters to each condition
        const finalWhereConditions = whereConditions.map(condition => ({
            ...condition,
            ...additionalFilters
        }));

        const total = await this.tasksRepository.count({
            where: finalWhereConditions
        });

        const tasks = await this.tasksRepository.find({
            where: finalWhereConditions,
            relations: ['project', 'board', 'list', 'creator', 'assignee'],
            select: {
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
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                assignee: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                }
            },
            order: {
                position: 'ASC',
                createdAt: 'DESC'
            },
            skip,
            take: limit
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data: tasks,
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

    async findByStatus(status: TaskStatus): Promise<Task[]> {
        return super.findAll({
            where: { status },
            relations: ['project', 'board', 'list', 'creator', 'assignee'],
            select: {
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
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                assignee: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                }
            },
            order: {
                position: 'ASC',
                createdAt: 'DESC'
            }
        });
    }

    async findByPriority(priority: TaskPriority): Promise<Task[]> {
        return super.findAll({
            where: { priority },
            relations: ['project', 'board', 'list', 'creator', 'assignee'],
            select: {
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
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                assignee: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                }
            },
            order: {
                position: 'ASC',
                createdAt: 'DESC'
            }
        });
    }

    async findByList(listId: string): Promise<Task[]> {
        return super.findAll({
            where: { listId },
            relations: ['project', 'board', 'list', 'creator', 'assignee'],
            select: {
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
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                assignee: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                }
            },
            order: {
                position: 'ASC',
                createdAt: 'DESC'
            }
        });
    }

    async findByBoard(boardId: string): Promise<Task[]> {
        return super.findAll({
            where: { boardId },
            relations: ['project', 'board', 'list', 'creator', 'assignee'],
            select: {
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
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                assignee: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                }
            },
            order: {
                position: 'ASC',
                createdAt: 'DESC'
            }
        });
    }

    async findByProject(projectId: string): Promise<Task[]> {
        return super.findAll({
            where: { projectId },
            relations: ['project', 'board', 'list', 'creator', 'assignee'],
            select: {
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
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                assignee: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                }
            },
            order: {
                position: 'ASC',
                createdAt: 'DESC'
            }
        });
    }

    async findByAssignee(assignedTo: string): Promise<Task[]> {
        return super.findAll({
            where: { assignedTo },
            relations: ['project', 'board', 'list', 'creator', 'assignee'],
            select: {
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
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                assignee: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                }
            },
            order: {
                position: 'ASC',
                createdAt: 'DESC'
            }
        });
    }
}