import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Board } from 'src/boards/entities/board.entity';
import { BaseEntity } from 'src/common/base.entity';

@Entity('board_members')
export class BoardMember extends BaseEntity {
  @PrimaryColumn({ name: 'board_id' })
  boardId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @Column({ default: 'member' })
  role: string;

  @CreateDateColumn({ name: 'added_at', type: 'timestamptz' })
  addedAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Board, board => board.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}