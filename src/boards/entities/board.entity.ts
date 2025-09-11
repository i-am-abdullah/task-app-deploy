import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { BoardMember } from 'src/board-members/entities/board-member.entity';
import { BoardStatus } from 'src/enums';

@Entity('boards')
export class Board extends BaseEntity {
  @Column()
  title: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({
    type: 'enum',
    enum: BoardStatus,
    default: BoardStatus.ACTIVE
  })
  status: BoardStatus;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Project, project => project.boards)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => BoardMember, member => member.board)
  members: BoardMember[];
}