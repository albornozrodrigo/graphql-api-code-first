import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../enums/role.enum';
import { Post } from '../../post/entities/post.entity';
import { Profile } from '../../profile/entities/profile.entity';

export const userDataMap: Record<string, string> = {
  id: 'id',
  name: 'name',
  email: 'email',
  role: 'role',
  profile: 'profile',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

@ObjectType()
@Entity()
export class User {
  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }

  @Field(() => Int, { description: 'User ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { nullable: false, description: 'User name' })
  @Column({ nullable: false })
  name: string;

  @Field(() => String, { description: 'User email' })
  @Column({ unique: true })
  email: string;

  @Field(() => String, { description: 'User Role' })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ nullable: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Profile, { nullable: true, description: 'User Profile' })
  @OneToOne(() => Profile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  profile?: Promise<Profile>;

  @Field(() => [Post], { description: 'User Posts' })
  @OneToMany(() => Post, (post) => post.user)
  posts: Promise<Post[]>;
}
