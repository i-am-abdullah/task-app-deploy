import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { UpdateBoardDto } from './dtos/board.dto';
import { CreateBoardDto } from './dtos/board.dto';
import { BaseService } from 'src/common/base.service';
import { UserRole, BoardStatus } from 'src/enums'
import { ProjectsService } from 'src/projects/project.service';

@Injectable()
export class BoardsService extends BaseService<Board> {
    constructor(
        @InjectRepository(Board)
        private readonly boardsRepository: Repository<Board>,
        private readonly projectsService: ProjectsService,
    ) {
        super(boardsRepository, 'Board');
    }

    async createBoard(createBoardDto: CreateBoardDto, userId: string, userRole: string): Promise<Board> {
        if (userRole !== UserRole.ADMIN && userRole !== UserRole.TEAM_LEAD) {
            throw new ForbiddenException('Only admins and team leads can create boards');
        }

        // Validate project exists
        await this.projectsService.findOne(createBoardDto.projectId);

        const boardData = {
            ...createBoardDto,
            createdBy: userId,
        };

        return super.create(boardData);
    }

    async findAll(): Promise<Board[]> {
        return super.findAll({
            relations: ['project', 'project.workspace', 'creator'],
            select: {
                project: {
                    id: true,
                    title: true,
                    workspace: {
                        id: true,
                        name: true,
                    }
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

    async findAllBoardsWithPagination(page: number = 1, limit: number = 10) {
        return super.findAllWithPagination(
            { page, limit },
            {
                relations: ['project', 'project.workspace', 'creator'],
                select: {
                    project: {
                        id: true,
                        title: true,
                        workspace: {
                            id: true,
                            name: true,
                        }
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

    async findOne(id: string): Promise<Board> {
        return super.findOne(id, {
            relations: ['project', 'project.workspace', 'creator', 'members', 'members.user'],
            select: {
                project: {
                    id: true,
                    title: true,
                    workspace: {
                        id: true,
                        name: true,
                    }
                },
                creator: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
                members: {
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

    async updateBoard(id: string, updateBoardDto: UpdateBoardDto, userRole: string): Promise<Board> {
        if (userRole !== UserRole.ADMIN && userRole !== UserRole.TEAM_LEAD) {
            throw new ForbiddenException('Only admins and team leads can update boards');
        }

        return super.update(id, updateBoardDto);
    }

    async removeBoard(id: string, userRole: string): Promise<void> {
        if (userRole !== UserRole.ADMIN && userRole !== UserRole.TEAM_LEAD) {
            throw new ForbiddenException('Only admins and team leads can delete boards');
        }

        return super.remove(id);
    }

async searchBoards(searchTerm: string): Promise<Board[]> {
    const boards = await super.search(searchTerm, ['title']);

    // If no ids found, return early to avoid building an IN() with empty list
    const boardIds = boards.map(b => b.id);
    if (!boardIds || boardIds.length === 0) return [];

    // Use TypeORM's In operator (not {$in: ...})
    return this.boardsRepository.find({
        where: { id: In(boardIds) },
        relations: ['project', 'project.workspace', 'creator'],
        select: {
            project: {
                id: true,
                title: true,
                workspace: {
                    id: true,
                    name: true,
                }
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

    async findByStatus(status: BoardStatus): Promise<Board[]> {
        return super.findAll({
            where: { status },
            relations: ['project', 'project.workspace', 'creator'],
            select: {
                project: {
                    id: true,
                    title: true,
                    workspace: {
                        id: true,
                        name: true,
                    }
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

    async findByProject(projectId: string): Promise<Board[]> {
        return super.findAll({
            where: { projectId },
            relations: ['project', 'project.workspace', 'creator'],
            select: {
                project: {
                    id: true,
                    title: true,
                    workspace: {
                        id: true,
                        name: true,
                    }
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