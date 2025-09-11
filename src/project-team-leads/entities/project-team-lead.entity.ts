import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { BaseEntity } from 'src/common/base.entity';

@Entity('project_team_leads')
export class ProjectTeamLead extends BaseEntity {
  @PrimaryColumn({ name: 'project_id' })
  projectId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @Column({ default: 'team_lead' })
  role: string;

  @ManyToOne(() => Project, project => project.teamLeads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}