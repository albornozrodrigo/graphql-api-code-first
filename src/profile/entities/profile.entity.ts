import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export const profileDataMap: Record<string, string> = {
  id: 'id',
  bio: 'bio',
  avatar: 'avatar',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

@ObjectType()
@Entity()
export class Profile {
  constructor(partial?: Partial<Profile>) {
    Object.assign(this, partial);
  }

  @Field(() => Int, { description: 'Profile ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { description: 'Profile bio' })
  @Column()
  bio: string;

  @Field(() => String, { description: 'Profile avatar' })
  @Column()
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => User, { description: 'User' })
  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  user: Promise<User>;
}
