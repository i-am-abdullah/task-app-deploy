import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BoardMembersService } from './board-member.service';
import { CreateBoardMemberDto, UpdateBoardMemberDto } from './dtos/board-member.dto';
import { ResponseUtil } from 'src/utils/response';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('board-members')
@UseGuards(AuthGuard)
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @Post()
  async create(@Body() createDto: CreateBoardMemberDto) {
    const member = await this.boardMembersService.create(createDto);
    return ResponseUtil.created(member, 'Board member added successfully');
  }

  @Get()
  async findAll(
    @Query('boardId') boardId?: string,
    @Query('userId') userId?: string,
  ) {
    if (boardId) {
      const members = await this.boardMembersService.findByBoard(boardId);
      return ResponseUtil.success(members, 'Board members retrieved successfully');
    }

    if (userId) {
      const memberships = await this.boardMembersService.findByUser(userId);
      return ResponseUtil.success(memberships, 'User board memberships retrieved successfully');
    }

    const members = await this.boardMembersService.findAll();
    return ResponseUtil.success(members, 'All board members retrieved successfully');
  }

  @Get(':boardId/:userId')
  async findOne(@Param('boardId') boardId: string, @Param('userId') userId: string) {
    const member = await this.boardMembersService.findOne(boardId, userId);
    return ResponseUtil.success(member, 'Board member retrieved successfully');
  }

  @Patch(':boardId/:userId')
  async update(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateBoardMemberDto,
  ) {
    const member = await this.boardMembersService.update(boardId, userId, updateDto);
    return ResponseUtil.updated(member, 'Board member updated successfully');
  }

  @Delete(':boardId/:userId')
  async remove(@Param('boardId') boardId: string, @Param('userId') userId: string) {
    await this.boardMembersService.remove(boardId, userId);
    return ResponseUtil.deleted('Board member removed successfully');
  }
}
