import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardMember } from './entities/board-member.entity';
import { CreateBoardMemberDto, UpdateBoardMemberDto } from './dtos/board-member.dto';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(BoardMember)
    private readonly boardMembersRepository: Repository<BoardMember>,
  ) {}

  async create(createBoardMemberDto: CreateBoardMemberDto): Promise<any> {
    const existing = await this.boardMembersRepository.findOne({
      where: {
        boardId: createBoardMemberDto.boardId,
        userId: createBoardMemberDto.userId,
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this board');
    }

    const member = this.boardMembersRepository.create(createBoardMemberDto as any);
    return await this.boardMembersRepository.save(member);
  }

  async findAll(): Promise<BoardMember[]> {
    return this.boardMembersRepository.find({
      relations: ['board', 'user'],
      select: {
        board: {
          id: true,
          name: true,
        } as any,
        user: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        } as any,
      } as any,
      order: {
        addedAt: 'DESC' as const,
      },
    });
  }

  async findByBoard(boardId: string): Promise<BoardMember[]> {
    return this.boardMembersRepository.find({
      where: { boardId },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        } as any,
      } as any,
      order: {
        addedAt: 'DESC' as const,
      },
    });
  }

  async findByUser(userId: string): Promise<BoardMember[]> {
    return this.boardMembersRepository.find({
      where: { userId },
      relations: ['board'],
      select: {
        board: {
          id: true,
          name: true,
        } as any,
      } as any,
      order: {
        addedAt: 'DESC' as const,
      },
    });
  }

  async findOne(boardId: string, userId: string): Promise<BoardMember> {
    const member = await this.boardMembersRepository.findOne({
      where: { boardId, userId },
      relations: ['board', 'user'],
      select: {
        board: {
          id: true,
          name: true,
        } as any,
        user: {
          id: true,
          username: true,
          email: true,
          fullName: true,
        } as any,
      } as any,
    });

    if (!member) {
      throw new NotFoundException('Board member not found');
    }

    return member;
  }

  async update(boardId: string, userId: string, updateDto: UpdateBoardMemberDto): Promise<BoardMember> {
    const member = await this.findOne(boardId, userId);

    await this.boardMembersRepository.update(
      { boardId, userId },
      updateDto as any,
    );

    return this.findOne(boardId, userId);
  }

  async remove(boardId: string, userId: string): Promise<void> {
    const result = await this.boardMembersRepository.delete({
      boardId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Board member not found');
    }
  }

  async removeByBoard(boardId: string): Promise<void> {
    await this.boardMembersRepository.delete({ boardId });
  }

  async removeByUser(userId: string): Promise<void> {
    await this.boardMembersRepository.delete({ userId });
  }
}
