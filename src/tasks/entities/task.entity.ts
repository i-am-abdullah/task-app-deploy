// src/tasks/entities/task.entity.ts
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Board } from 'src/boards/entities/board.entity';
import { List } from 'src/lists/entities/list.entity';
import { TaskAssignee } from 'src/task-assignees/entities/task-assignee.entity';
import { TaskStatus, TaskPriority } from 'src/enums';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column()
  title: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'board_id' })
  boardId: string;

  @Column({ name: 'list_id' })
  listId: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority: TaskPriority;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Project, project => project.tasks)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Board, board => board.tasks)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @ManyToOne(() => List, list => list.tasks)
  @JoinColumn({ name: 'list_id' })
  list: List;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => TaskAssignee, taskAssignee => taskAssignee.task)
  taskAssignees: TaskAssignee[];

  // Virtual property to get assignees
  get assignees(): User[] {
    return this.taskAssignees?.map(ta => ta.user) || [];
  }
}