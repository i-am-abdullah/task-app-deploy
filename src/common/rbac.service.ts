import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectTeamLeadsService } from 'src/project-team-leads/project-team-lead.service';
import { BoardMembersService } from 'src/board-members/board-member.service';
import { UserRole } from 'src/enums';

export interface EntityWithAccess {
  projectId?: string;
  boardId?: string;
}

@Injectable()
export class RBACService {
  constructor(
    private readonly projectTeamLeadsService: ProjectTeamLeadsService,
    private readonly boardMembersService: BoardMembersService,
  ) {}

  async checkAccess(
    userId: string,
    userRole: string,
    entity: EntityWithAccess,
    action: 'read' | 'write' | 'delete' = 'read'
  ): Promise<boolean> {
    // Admins have full access to everything
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    if (userRole === UserRole.TEAM_LEAD && entity.projectId) {
      try {
        await this.projectTeamLeadsService.findOne(entity.projectId, userId);
        return true;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new ForbiddenException('Access denied: Not authorized for this project');
        }
        throw error;
      }
    }

    if (userRole === UserRole.USER && entity.boardId) {
      try {
        await this.boardMembersService.findOne(entity.boardId, userId);
        return true;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new ForbiddenException('Access denied: Not authorized for this board');
        }
        throw error;
      }
    }

    throw new ForbiddenException('Access denied: Insufficient permissions');
  }

  async validateEntityAccess(
    userId: string,
    userRole: string,
    entity: EntityWithAccess,
    action: 'read' | 'write' | 'delete' = 'read'
  ): Promise<void> {
    await this.checkAccess(userId, userRole, entity, action);
  }
}
