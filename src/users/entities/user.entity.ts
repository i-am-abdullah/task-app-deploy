import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { ProjectTeamLead } from 'src/project-team-leads/entities/project-team-lead.entity';
import { BoardMember } from 'src/board-members/entities/board-member.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true, type: 'timestamp' })
  lastLogin: Date;

  @OneToMany(() => ProjectTeamLead, ptl => ptl.user)
  projectTeamLeads?: ProjectTeamLead[];

  @OneToMany(() => BoardMember, bm => bm.user)
  boardMemberships?: BoardMember[];
}
