import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../post/entities/post.entity';
import { PostLoader } from '../post/post.loader';
import { PostService } from '../post/post.service';
import { User } from '../user/entities/user.entity';
import { UserLoader } from '../user/user.loader';
import { UserService } from '../user/user.service';
import { Profile } from './entities/profile.entity';
import { ProfileLoader } from './profile.loader';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User, Post])],
  providers: [
    ProfileResolver,
    ProfileService,
    ProfileLoader,
    UserService,
    UserLoader,
    PostService,
    PostLoader,
  ],
})
export class ProfileModule {}
