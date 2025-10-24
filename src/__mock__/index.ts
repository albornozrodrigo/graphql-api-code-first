/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLResolveInfo } from 'graphql';
import { PaginationInput } from '../common/dto/pagination.input';
import { Role } from '../enums/role.enum';
import { Post } from '../post/entities/post.entity';
import { Profile } from '../profile/entities/profile.entity';
import { Tag } from '../tag/entities/tag.entity';
import { User } from '../user/entities/user.entity';

export const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'password',
  posts: Promise.resolve([]),
  profile: Promise.resolve(new Profile()),
  role: Role.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockProfile: Profile = {
  id: 1,
  bio: 'Test bio',
  avatar: 'test-avatar.png',
  user: Promise.resolve(mockUser),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockProfiles = (count: number): Profile[] => {
  return Array.from({ length: count }, (_, i) => {
    return new Profile({
      ...mockProfile,
      id: i + 1,
      user: Promise.resolve(new User({ ...mockUser, id: i + 1 })),
    });
  });
};

export const mockPost: Post = {
  id: 1,
  title: 'Test Post',
  content: 'Test Content',
  createdAt: new Date(),
  updatedAt: new Date(),
  user: Promise.resolve(mockUser),
  tags: [],
};

export const mockPosts = (count: number): Post[] => {
  return Array.from({ length: count }, (_, i) => {
    return {
      ...mockPost,
      id: i + 1,
      user: Promise.resolve(new User({ ...mockUser, id: i + 1 })),
    };
  });
};

export const mockTag: Tag = {
  id: 1,
  name: 'Test Tag',
  createdAt: new Date(),
  updatedAt: new Date(),
  posts: Promise.resolve([mockPost]),
};

export const mockTags = (count: number): Tag[] => {
  return Array.from({ length: count }, (_, i) => {
    return {
      ...mockTag,
      id: i + 1,
      posts: Promise.resolve(mockPosts(count)),
    };
  });
};

export const mockPagination: PaginationInput = {
  page: 1,
  limit: 10,
};

export const mockInfo: GraphQLResolveInfo = {
  fieldName: '',
  fieldNodes: [],
  returnType: undefined,
  parentType: undefined,
  path: undefined,
  schema: undefined,
  fragments: undefined,
  rootValue: undefined,
  operation: undefined,
  variableValues: undefined,
  cacheControl: undefined,
} as any;
