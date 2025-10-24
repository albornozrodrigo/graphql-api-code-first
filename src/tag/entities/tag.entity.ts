import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';

export const tagDataMap: Record<string, string> = {
  id: 'id',
  name: 'name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

@ObjectType()
@Entity()
export class Tag {
  @Field(() => Int, { description: 'Tag ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { description: 'Tag name' })
  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Post], { description: 'Posts' })
  @ManyToMany(() => Post, (post) => post.tags)
  posts: Promise<Post[]>;
}
