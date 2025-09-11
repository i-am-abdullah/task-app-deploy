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
import { BoardsService } from './board.service';
import { CreateBoardDto } from './dtos/board.dto';
import { UpdateBoardDto } from './dtos/board.dto';
import { ResponseUtil } from 'src/utils/response';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { BoardStatus } from 'src/enums';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@Controller('boards')
@UseGuards(AuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(@Body() createBoardDto: CreateBoardDto, @Request() req:RequestWithUser) {
    const board = await this.boardsService.createBoard(
      createBoardDto, 
      req.user.id, 
      req.user.role
    );
    return ResponseUtil.created(board, 'Board created successfully');
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: BoardStatus,
    @Query('projectId') projectId?: string,
    @Query('all') all?: string
  ) {
    if (search) {
      const boards = await this.boardsService.searchBoards(search);
      return ResponseUtil.success(boards, 'Boards retrieved successfully');
    }

    if (status) {
      const boards = await this.boardsService.findByStatus(status);
      return ResponseUtil.success(boards, 'Boards retrieved successfully');
    }

    if (projectId) {
      const boards = await this.boardsService.findByProject(projectId);
      return ResponseUtil.success(boards, 'Boards retrieved successfully');
    }

    if (all === 'true') {
      const boards = await this.boardsService.findAll();
      return ResponseUtil.success(boards, 'All boards retrieved successfully');
    }

    const result = await this.boardsService.findAllBoardsWithPagination(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
    return ResponseUtil.success(result, 'Boards retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const board = await this.boardsService.findOne(id);
    return ResponseUtil.success(board, 'Board retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() req:RequestWithUser
  ) {
    const board = await this.boardsService.updateBoard(id, updateBoardDto, req.user.role);
    return ResponseUtil.updated(board, 'Board updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.boardsService.removeBoard(id, req.user.role);
    return ResponseUtil.deleted('Board deleted successfully');
  }
}