import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../post/entities/post.entity';
import { PostLoader } from '../post/post.loader';
import { PostService } from '../post/post.service';
import { Profile } from '../profile/entities/profile.entity';
import { ProfileLoader } from '../profile/profile.loader';
import { ProfileService } from '../profile/profile.service';
import { User } from './entities/user.entity';
import { UserLoader } from './user.loader';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Profile])],
  providers: [
    UserResolver,
    UserService,
    UserLoader,
    PostService,
    PostLoader,
    ProfileService,
    ProfileLoader,
  ],
  exports: [TypeOrmModule],
})
export class UserModule {}
