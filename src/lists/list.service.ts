// src/lists/list.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { List } from './entities/list.entity';
import { UpdateListDto } from './dtos/list.dto';
import { CreateListDto } from './dtos/list.dto';
import { BaseService } from 'src/common/base.service';
import { ListStatus } from 'src/enums';
import { BoardsService } from 'src/boards/board.service';
import { RBACService } from 'src/common/rbac.service';

@Injectable()
export class ListsService extends BaseService<List> {
    constructor(
        @InjectRepository(List)
        private readonly listsRepository: Repository<List>,
        private readonly boardsService: BoardsService,
        private readonly rbacService: RBACService,
    ) {
        super(listsRepository, 'List');
    }

    async createList(createListDto: CreateListDto, userId: string, userRole: string): Promise<List> {
        // Validate board exists and get project info
        const board = await this.boardsService.findOne(createListDto.boardId);
        
        // Check RBAC access
        await this.rbacService.validateEntityAccess(userId, userRole, {
            projectId: board.projectId,
            boardId: createListDto.boardId
        }, 'write');

        const listData = {
            ...createListDto,
            createdBy: userId,
            projectId: board.projectId,
        };

        return super.create(listData);
    }

    async findAll(): Promise<List[]> {
        return super.findAll({
            relations: ['project', 'board', 'creator'],
            select: {
                project: {
                    id: true,
                    title: true,
                },
                board: {
                    id: true,
                    title: true,
                },
                creator: {
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

    async findAllListsWithPagination(page: number = 1, limit: number = 10) {
        return super.findAllWithPagination(
            { page, limit },
            {
                relations: ['project', 'board', 'creator'],
                select: {
                    project: {
                        id: true,
                        title: true,
                    },
                    board: {
                        id: true,
                        title: true,
                    },
                    creator: {
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

    async findOneList(id: string, userId?: string, userRole?: string): Promise<List> {
        const list = await super.findOne(id, {
            relations: ['project', 'board', 'creator', 'tasks'],
            select: {
                project: {
                    id: true,
                    title: true,
                },
                board: {
                    id: true,
                    title: true,
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                tasks: {
                    id: true,
                    title: true,
                    status: true,
                    position: true,
                }
            }
        });

        // Check RBAC access if user info provided
        if (userId && userRole) {
            await this.rbacService.validateEntityAccess(userId, userRole, {
                projectId: list.projectId,
                boardId: list.boardId
            }, 'read');
        }

        return list;
    }

    async updateList(id: string, updateListDto: UpdateListDto, userId: string, userRole: string): Promise<List> {
        const list = await this.findOne(id);
        
        // Check RBAC access
        await this.rbacService.validateEntityAccess(userId, userRole, {
            projectId: list.projectId,
            boardId: list.boardId
        }, 'write');

        return super.update(id, updateListDto);
    }

    async removeList(id: string, userId: string, userRole: string): Promise<void> {
        const list = await this.findOne(id);
        
        // Check RBAC access
        await this.rbacService.validateEntityAccess(userId, userRole, {
            projectId: list.projectId,
            boardId: list.boardId
        }, 'delete');

        return super.remove(id);
    }

    async searchLists(searchTerm: string): Promise<List[]> {
        const lists = await super.search(searchTerm, ['title']);

        const listIds = lists.map(l => l.id);
        if (!listIds || listIds.length === 0) return [];

        return this.listsRepository.find({
            where: { id: In(listIds) },
            relations: ['project', 'board', 'creator'],
            select: {
                project: {
                    id: true,
                    title: true,
                },
                board: {
                    id: true,
                    title: true,
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

    async searchListsWithPagination(
        searchTerm: string,
        page: number = 1,
        limit: number = 10,
        boardId?: string,
        projectId?: string
    ) {
        const skip = (page - 1) * limit;

        const whereConditions: any = {
            title: Like(`%${searchTerm}%`)
        };

        if (boardId) {
            whereConditions.boardId = boardId;
        }

        if (projectId) {
            whereConditions.projectId = projectId;
        }

        const total = await this.listsRepository.count({
            where: whereConditions
        });

        const lists = await this.listsRepository.find({
            where: whereConditions,
            relations: ['project', 'board', 'creator'],
            select: {
                project: {
                    id: true,
                    title: true,
                },
                board: {
                    id: true,
                    title: true,
                },
                creator: {
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
            data: lists,
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

    async findByStatus(status: ListStatus): Promise<List[]> {
        return super.findAll({
            where: { status },
            relations: ['project', 'board', 'creator'],
            select: {
                project: {
                    id: true,
                    title: true,
                },
                board: {
                    id: true,
                    title: true,
                },
                creator: {
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

    async findByBoard(boardId: string): Promise<List[]> {
        return super.findAll({
            where: { boardId },
            relations: ['project', 'board', 'creator'],
            select: {
                project: {
                    id: true,
                    title: true,
                },
                board: {
                    id: true,
                    title: true,
                },
                creator: {
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

    async findByProject(projectId: string): Promise<List[]> {
        return super.findAll({
            where: { projectId },
            relations: ['project', 'board', 'creator'],
            select: {
                project: {
                    id: true,
                    title: true,
                },
                board: {
                    id: true,
                    title: true,
                },
                creator: {
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