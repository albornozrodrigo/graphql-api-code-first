import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tag } from './tag.entity';
import { User } from './user.entity';

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

  @Field(() => User, { description: 'User' })
  @ManyToOne(() => User)
  user: Promise<User>;

  @Field(() => [Tag], { description: 'Tags' })
  @ManyToMany(() => Tag, (tag) => tag.posts, { cascade: true })
  @JoinTable()
  tags: Promise<Tag[]>;
}
