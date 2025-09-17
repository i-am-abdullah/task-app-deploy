import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Board } from 'src/boards/entities/board.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { ListStatus } from 'src/enums';

@Entity('lists')
export class List extends BaseEntity {
  @Column()
  title: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'board_id' })
  boardId: string;

  @Column({
    type: 'enum',
    enum: ListStatus,
    default: ListStatus.ACTIVE
  })
  status: ListStatus;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Project, project => project.lists)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Board, board => board.lists)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => Task, task => task.list)
  tasks: Task[];
}