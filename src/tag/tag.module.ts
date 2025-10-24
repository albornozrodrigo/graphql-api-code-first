import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../post/entities/post.entity';
import { PostLoader } from '../post/post.loader';
import { PostService } from '../post/post.service';
import { Tag } from './entities/tag.entity';
import { TagLoader } from './tag.loader';
import { TagResolver } from './tag.resolver';
import { TagService } from './tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Post])],
  providers: [TagResolver, TagService, TagLoader, PostService, PostLoader],
})
export class TagModule {}
