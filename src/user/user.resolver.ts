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
import { GqlAuthGuard } from '../auth/auth.guard';
import { PaginationInput } from '../common/dto/pagination.input';
import { Role } from '../enums/role.enum';
import { PostLoader } from '../post/post.loader';
import { ProfileLoader } from '../profile/profile.loader';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserPasswordInput } from './dto/update-user-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly profileLoader: ProfileLoader,
    private readonly postLoader: PostLoader,
  ) {}

  @Mutation(() => User, { name: 'createUser' })
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    createUserInput.role = Role.USER;
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'allUsers' })
  findAll(
    @Info() info: GraphQLResolveInfo,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.userService.findAll(info, pagination);
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id') id: number, @Info() info: GraphQLResolveInfo) {
    return this.userService.findOne(id, info);
  }

  // Protected queries and mutations

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'me' })
  getAuthenticatedUser(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, { name: 'updateUser' })
  update(
    @CurrentUser() user: User,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.userService.update(user.id, updateUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'updateUserPassword' })
  updateUserPassword(
    @CurrentUser() user: User,
    @Args('updateUserPasswordInput')
    updateUserPasswordInput: UpdateUserPasswordInput,
  ) {
    return this.userService.updatePassword(user.id, updateUserPasswordInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'removeUser' })
  remove(@CurrentUser() user: User) {
    return this.userService.remove(user.id);
  }

  // Fields

  @ResolveField('profile')
  async profile(@Parent() user: User, @Info() info: GraphQLResolveInfo) {
    if (!user) return null;

    const loader = this.profileLoader.setInfo(info);
    const profile = await loader.findProfilesByUserIds.load(user.id);

    return profile;
  }

  @ResolveField('posts')
  async posts(@Parent() user: User, @Info() info: GraphQLResolveInfo) {
    if (!user) return [];

    const loader = this.postLoader.setInfo(info);
    const posts = await loader.findPostsByUserIds.load(user.id);

    return posts;
  }
}
