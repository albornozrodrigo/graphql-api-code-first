import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '../tag/entities/tag.entity';
import { TagService } from '../tag/tag.service';
import { User } from '../user/entities/user.entity';
import { UserLoader } from '../user/user.loader';
import { UserService } from '../user/user.service';
import { Post } from './entities/post.entity';
import { PostLoader } from './post.loader';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Tag])],
  providers: [
    PostResolver,
    PostService,
    PostLoader,
    UserService,
    UserLoader,
    TagService,
  ],
})
export class PostModule {}
