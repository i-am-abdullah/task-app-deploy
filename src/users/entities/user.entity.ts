import { Column, Entity, OneToMany} from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';

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

  @Column({ nullable: true})
  role: string;

  @Column({ nullable: true, type: 'timestamp' })
  lastLogin: Date;
}
