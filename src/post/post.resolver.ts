import { UseGuards } from '@nestjs/common';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { CurrentUser } from '../auth/auth.decorator';
import { GqlAuthGuard } from '../auth/guards/auth.guard';
import { PaginationInput } from '../common/dto/pagination.input';
import { TagLoader } from '../tag/tag.loader';
import { User } from '../user/entities/user.entity';
import { UserLoader } from '../user/user.loader';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userLoader: UserLoader,
    private readonly tagLoader: TagLoader,
  ) {}

  @Query(() => [Post], { name: 'allPosts' })
  findAll(
    @Info() info: GraphQLResolveInfo,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.postService.findAll(info, pagination);
  }

  @Query(() => Post, { name: 'post' })
  findOne(@Args('id') id: number, @Info() info: GraphQLResolveInfo) {
    return this.postService.findOne(id, info);
  }

  // Protected queries and mutations

  @UseGuards(GqlAuthGuard)
  @Query(() => [Post], { name: 'allPostsByUser' })
  findAllByUserId(
    @CurrentUser() user: User,
    @Info() info: GraphQLResolveInfo,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.postService.findAllByUserId(user.id, info, pagination);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Post, { name: 'createPost' })
  create(
    @CurrentUser() user: User,
    @Args('createPostInput') createPostInput: CreatePostInput,
  ) {
    return this.postService.create(user.id, createPostInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Post, { name: 'updatePost' })
  update(
    @CurrentUser() user: User,
    @Args('id') id: number,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
  ) {
    return this.postService.update(id, user.id, updatePostInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'removePost' })
  remove(@CurrentUser() user: User, @Args('id') id: number) {
    return this.postService.remove(id, user.id);
  }

  // Fields

  @ResolveField('user')
  async user(@Parent() post: Post, @Info() info: GraphQLResolveInfo) {
    if (!post) return null;

    const loader = this.userLoader.setInfo(info);
    const user = await loader.findUsersByPostId.load(post.id);

    return user;
  }

  @ResolveField('tags')
  async tags(@Parent() post: Post, @Info() info: GraphQLResolveInfo) {
    if (!post) return [];

    const loader = this.tagLoader.setInfo(info);
    const tags = await loader.findTagsByPostIds.load(post.id);

    return tags;
  }
}
