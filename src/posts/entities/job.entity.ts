import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('job')
export class JobEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.job)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
