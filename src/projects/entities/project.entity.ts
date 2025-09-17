import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Board } from 'src/boards/entities/board.entity';
import { ProjectTeamLead } from 'src/project-team-leads/entities/project-team-lead.entity';
import { List } from 'src/lists/entities/list.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { ProjectStatus } from 'src/enums';

@Entity('projects')
export class Project extends BaseEntity {
  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE
  })
  status: ProjectStatus;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => Workspace, workspace => workspace.projects)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => Board, board => board.project)
  boards: Board[];

  @OneToMany(() => ProjectTeamLead, teamLead => teamLead.project)
  teamLeads: ProjectTeamLead[];

  @OneToMany(() => List, list => list.project)
  lists: List[];

  @OneToMany(() => Task, task => task.project)
  tasks: Task[];
}