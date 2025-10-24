import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tag } from '../../tag/entities/tag.entity';
import { User } from '../../user/entities/user.entity';

export const postDataMap: Record<string, string> = {
  id: 'id',
  title: 'title',
  content: 'content',
  user: 'user',
  tags: 'tags',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int, { description: 'Post ID' })
  @PrimaryGeneratedColumn()
  declare id: number;

  @Field(() => String, { description: 'Post title' })
  @Column()
  title: string;

  @Field(() => String, { description: 'Post content' })
  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => User, { description: 'User' })
  @ManyToOne(() => User)
  user: Promise<User>;

  @Field(() => [Tag], { description: 'Tags' })
  @ManyToMany(() => Tag, (tag) => tag.posts, { cascade: true })
  @JoinTable()
  tags: Tag[];
}
