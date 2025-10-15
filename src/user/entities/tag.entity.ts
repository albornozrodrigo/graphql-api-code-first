import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@ObjectType()
@Entity()
export class Tag {
  @Field(() => Int, { description: 'Tag ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { description: 'Tag name' })
  @Column()
  name: string;

  @Field(() => [Post], { description: 'Posts' })
  @ManyToMany(() => Post, (post) => post.tags)
  posts: Promise<Post[]>;
}
