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
import { GqlAuthGuard } from '../auth/auth.guard';
import { PaginationInput } from '../common/dto/pagination.input';
import { PostLoader } from '../post/post.loader';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { Tag } from './entities/tag.entity';
import { TagService } from './tag.service';

@Resolver(() => Tag)
export class TagResolver {
  constructor(
    private readonly tagService: TagService,
    private readonly postLoader: PostLoader,
  ) {}

  @Query(() => [Tag], { name: 'allTags' })
  findAll(
    @Info() info: GraphQLResolveInfo,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.tagService.findAll(info, pagination);
  }

  @Query(() => Tag, { name: 'tag' })
  findOne(@Args('id') id: number, @Info() info: GraphQLResolveInfo) {
    return this.tagService.findOne(id, info);
  }

  // Protected queries and mutations

  @UseGuards(GqlAuthGuard)
  @Query(() => [Tag], { name: 'allTagsByPostId' })
  findAllByPostId(
    @Args('postId') postId: number,
    @Info() info: GraphQLResolveInfo,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.tagService.findAllByPostId(postId, info, pagination);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Tag, { name: 'createTag' })
  create(@Args('createTagInput') createTagInput: CreateTagInput) {
    return this.tagService.create(createTagInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Tag)
  updateTag(
    @Args('id') id: number,
    @Args('updateTagInput') updateTagInput: UpdateTagInput,
  ) {
    return this.tagService.update(id, updateTagInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'removeTag' })
  removeTag(@Args('id') id: number) {
    return this.tagService.remove(id);
  }

  // Fields

  @ResolveField('posts')
  async posts(@Parent() tag: Tag, @Info() info: GraphQLResolveInfo) {
    if (!tag) return null;

    const loader = this.postLoader.setInfo(info);
    const posts = await loader.findPostsByUserIds.load(tag.id);

    return posts;
  }
}
