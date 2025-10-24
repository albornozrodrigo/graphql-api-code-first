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
import { User } from '../user/entities/user.entity';
import { UserLoader } from '../user/user.loader';
import { CreateProfileInput } from './dto/create-profile.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly userLoader: UserLoader,
  ) {}

  @Query(() => [Profile], { name: 'allProfiles' })
  findAll(
    @Info() info: GraphQLResolveInfo,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.profileService.findAll(info, pagination);
  }

  @Query(() => Profile, { name: 'profile' })
  findOne(@Args('id') id: number, @Info() info: GraphQLResolveInfo) {
    return this.profileService.findOne(id, info);
  }

  // Protected queries and mutations

  @UseGuards(GqlAuthGuard)
  @Query(() => Profile, { name: 'profileByUserId' })
  findOneByUserId(@CurrentUser() user: User, @Info() info: GraphQLResolveInfo) {
    return this.profileService.findOneByUserId(user.id, info);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Profile, { name: 'createProfile' })
  create(
    @CurrentUser() user: User,
    @Args('createProfileInput') createProfileInput: CreateProfileInput,
  ) {
    return this.profileService.create(user.id, createProfileInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Profile, { name: 'updateProfile' })
  updateProfile(
    @CurrentUser() user: User,
    @Args('id') id: number,
    @Args('updateProfileInput') updateProfileInput: UpdateProfileInput,
  ) {
    return this.profileService.update(id, user.id, updateProfileInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'removeProfile' })
  removeProfile(@CurrentUser() user: User) {
    return this.profileService.remove(user.id);
  }

  // Fields

  @ResolveField('user')
  async user(@Parent() profile: Profile, @Info() info: GraphQLResolveInfo) {
    if (!profile) return null;

    const loader = this.userLoader.setInfo(info);
    const user = await loader.findUsersByUserId.load((await profile.user).id);

    return user;
  }
}
