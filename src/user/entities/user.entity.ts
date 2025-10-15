import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Role } from 'src/enums/role.enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { Profile } from './profile.entity';

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

  @Column({ nullable: true })
  password: string;

  @Field(() => Profile, { nullable: true, description: 'User Profile' })
  @OneToOne(() => Profile, { nullable: true, cascade: true })
  @JoinColumn()
  profile?: Promise<Profile>;

  @Field(() => [Post], { description: 'User Posts' })
  @OneToMany(() => Post, (post) => post.user)
  posts: Promise<Post[]>;
}
