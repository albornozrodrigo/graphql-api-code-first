import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@ObjectType()
@Entity()
export class Profile {
  @Field(() => Int, { description: 'Profile ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { description: 'Profile bio' })
  @Column()
  bio: string;

  @Field(() => String, { description: 'Profile avatar' })
  @Column()
  avatar: string;

  @Field(() => User, { description: 'User' })
  @OneToOne(() => User, (user) => user.profile)
  user: Promise<User>;
}
