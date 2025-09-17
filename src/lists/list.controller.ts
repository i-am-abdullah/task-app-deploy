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
import { ListsService } from './list.service';
import { CreateListDto } from './dtos/list.dto';
import { UpdateListDto } from './dtos/list.dto';
import { ResponseUtil } from 'src/utils/response';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ListStatus } from 'src/enums';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@Controller('lists')
@UseGuards(AuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  async create(@Body() createListDto: CreateListDto, @Request() req: RequestWithUser) {
    const list = await this.listsService.createList(
      createListDto,
      req.user.id,
      req.user.role
    );
    return ResponseUtil.created(list, 'List created successfully');
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: ListStatus,
    @Query('boardId') boardId?: string,
    @Query('projectId') projectId?: string,
    @Query('all') all?: string
  ) {
    if (search) {
      const result = await this.listsService.searchListsWithPagination(
        search,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 10,
        boardId,
        projectId
      );
      return ResponseUtil.success(result, 'Lists retrieved successfully');
    }

    if (status) {
      const lists = await this.listsService.findByStatus(status);
      return ResponseUtil.success(lists, 'Lists retrieved successfully');
    }

    if (boardId) {
      const lists = await this.listsService.findByBoard(boardId);
      return ResponseUtil.success(lists, 'Lists retrieved successfully');
    }

    if (projectId) {
      const lists = await this.listsService.findByProject(projectId);
      return ResponseUtil.success(lists, 'Lists retrieved successfully');
    }

    if (all === 'true') {
      const lists = await this.listsService.findAll();
      return ResponseUtil.success(lists, 'All lists retrieved successfully');
    }

    const result = await this.listsService.findAllListsWithPagination(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
    return ResponseUtil.success(result, 'Lists retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const list = await this.listsService.findOneList(id, req.user.id, req.user.role);
    return ResponseUtil.success(list, 'List retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateListDto: UpdateListDto,
    @Request() req: RequestWithUser
  ) {
    const list = await this.listsService.updateList(id, updateListDto, req.user.id, req.user.role);
    return ResponseUtil.updated(list, 'List updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.listsService.removeList(id, req.user.id, req.user.role);
    return ResponseUtil.deleted('List deleted successfully');
  }
}