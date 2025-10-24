/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import { Role } from '../../enums/role.enum';
import { User } from '../../user/entities/user.entity';
import { Post } from '../entities/post.entity';
import { PostLoader } from '../post.loader';
import { PostService } from '../post.service';

describe('PostLoader', () => {
  let loader: PostLoader;
  let postService: PostService;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    password: 'hashedPassword',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: undefined,
    posts: Promise.resolve([]),
  };

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: Promise.resolve(mockUser),
    tags: [],
  };

  const mockPost2: Post = {
    id: 2,
    title: 'Test Post 2',
    content: 'Test Content 2',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: Promise.resolve(mockUser),
    tags: [],
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostLoader,
        {
          provide: PostService,
          useValue: {
            findAllByIds: jest.fn(),
            findAllByUserIds: jest.fn(),
            findAllByTagIds: jest.fn(),
          },
        },
      ],
    }).compile();

    loader = await module.resolve<PostLoader>(PostLoader);
    postService = module.get<PostService>(PostService);

    // Set the info for the loader
    loader.setInfo(mockGraphQLResolveInfo);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
  });

  describe('setInfo', () => {
    it('should set info and return loader instance', () => {
      const result = loader.setInfo(mockGraphQLResolveInfo);

      expect(result).toBe(loader);
    });
  });

  describe('findPostsByPostId', () => {
    it('should return posts by post ids', async () => {
      const postIds = [1, 2];
      const expectedPosts = [mockPost, mockPost2];

      jest.spyOn(postService, 'findAllByIds').mockResolvedValue(expectedPosts);

      const result = await loader.findPostsByPostId.loadMany(postIds);

      expect(result).toEqual(expectedPosts);
      expect(postService.findAllByIds).toHaveBeenCalledWith(
        postIds,
        mockGraphQLResolveInfo,
      );
    });

    it('should return posts in the same order as requested ids', async () => {
      const postIds = [2, 1];
      const servicePosts = [mockPost2, mockPost];

      jest.spyOn(postService, 'findAllByIds').mockResolvedValue(servicePosts);

      const result = await loader.findPostsByPostId.loadMany(postIds);

      expect(result).toEqual([mockPost2, mockPost]);
    });

    it('should throw error when post is not found', async () => {
      const postIds = [1, 999];
      const servicePosts = [mockPost];

      jest.spyOn(postService, 'findAllByIds').mockResolvedValue(servicePosts);

      const result = await loader.findPostsByPostId.loadMany(postIds);

      // DataLoader returns an array with errors for missing items
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Error);
      expect(result[1]).toBeInstanceOf(Error);
      expect((result[0] as Error).message).toBe('Post with id 999 not found');
      expect((result[1] as Error).message).toBe('Post with id 999 not found');
    });

    it('should handle empty post ids array', async () => {
      const postIds: number[] = [];

      jest.spyOn(postService, 'findAllByIds').mockResolvedValue([]);

      const result = await loader.findPostsByPostId.loadMany(postIds);

      expect(result).toEqual([]);

      // DataLoader doesn't call the batch function for empty arrays
      expect(postService.findAllByIds).not.toHaveBeenCalled();
    });
  });

  describe('findPostsByUserIds', () => {
    it('should return posts grouped by user ids', async () => {
      const userIds = [1, 2];
      const servicePosts = [mockPost, mockPost2];

      jest
        .spyOn(postService, 'findAllByUserIds')
        .mockResolvedValue(servicePosts);

      const result = await loader.findPostsByUserIds.loadMany(userIds);

      expect(result).toEqual([[mockPost, mockPost2], []]);
      expect(postService.findAllByUserIds).toHaveBeenCalledWith(
        userIds,
        mockGraphQLResolveInfo,
      );
    });

    it('should return empty arrays for users with no posts', async () => {
      const userIds = [1, 2];
      const servicePosts: Post[] = [];

      jest
        .spyOn(postService, 'findAllByUserIds')
        .mockResolvedValue(servicePosts);

      const result = await loader.findPostsByUserIds.loadMany(userIds);

      expect(result).toEqual([[], []]);
    });

    it('should handle empty user ids array', async () => {
      const userIds: number[] = [];

      jest.spyOn(postService, 'findAllByUserIds').mockResolvedValue([]);

      const result = await loader.findPostsByUserIds.loadMany(userIds);

      expect(result).toEqual([]);

      // DataLoader doesn't call the batch function for empty arrays
      expect(postService.findAllByUserIds).not.toHaveBeenCalled();
    });

    it('should group posts correctly by user id', async () => {
      const userIds = [1, 2];
      const user1 = { ...mockUser, id: 1 };
      const user2 = { ...mockUser, id: 2 };
      const post1 = { ...mockPost, id: 1, user: Promise.resolve(user1) };
      const post2 = { ...mockPost2, id: 2, user: Promise.resolve(user2) };
      const servicePosts = [post1, post2];

      jest
        .spyOn(postService, 'findAllByUserIds')
        .mockResolvedValue(servicePosts);

      const result = await loader.findPostsByUserIds.loadMany(userIds);

      expect(result).toEqual([[post1], [post2]]);
    });
  });

  describe('findPostsByTagIds', () => {
    it('should return posts grouped by tag ids', async () => {
      const tagIds = [1, 2];
      const servicePosts = [mockPost, mockPost2];

      jest
        .spyOn(postService, 'findAllByTagIds')
        .mockResolvedValue(servicePosts);

      const result = await loader.findPostsByTagIds.loadMany(tagIds);

      expect(result).toEqual([[mockPost, mockPost2], []]);
      expect(postService.findAllByTagIds).toHaveBeenCalledWith(
        tagIds,
        mockGraphQLResolveInfo,
      );
    });

    it('should return empty arrays for tags with no posts', async () => {
      const tagIds = [1, 2];
      const servicePosts: Post[] = [];

      jest
        .spyOn(postService, 'findAllByTagIds')
        .mockResolvedValue(servicePosts);

      const result = await loader.findPostsByTagIds.loadMany(tagIds);

      expect(result).toEqual([[], []]);
    });

    it('should handle empty tag ids array', async () => {
      const tagIds: number[] = [];

      jest.spyOn(postService, 'findAllByTagIds').mockResolvedValue([]);

      const result = await loader.findPostsByTagIds.loadMany(tagIds);

      expect(result).toEqual([]);

      // DataLoader doesn't call the batch function for empty arrays
      expect(postService.findAllByTagIds).not.toHaveBeenCalled();
    });

    it('should group posts correctly by tag id', async () => {
      const tagIds = [1, 2];
      const user1 = { ...mockUser, id: 1 };
      const user2 = { ...mockUser, id: 2 };
      const post1 = { ...mockPost, id: 1, user: Promise.resolve(user1) };
      const post2 = { ...mockPost2, id: 2, user: Promise.resolve(user2) };
      const servicePosts = [post1, post2];

      jest
        .spyOn(postService, 'findAllByTagIds')
        .mockResolvedValue(servicePosts);

      const result = await loader.findPostsByTagIds.loadMany(tagIds);

      expect(result).toEqual([[post1], [post2]]);
    });
  });

  describe('DataLoader caching', () => {
    it('should cache results for findPostsByPostId', async () => {
      const postIds = [1];
      const expectedPosts = [mockPost];

      jest.spyOn(postService, 'findAllByIds').mockResolvedValue(expectedPosts);

      // First call
      const result1 = await loader.findPostsByPostId.loadMany(postIds);

      // Second call should use cache
      const result2 = await loader.findPostsByPostId.loadMany(postIds);

      expect(result1).toEqual(result2);
      expect(postService.findAllByIds).toHaveBeenCalledTimes(1);
    });

    it('should cache results for findPostsByUserIds', async () => {
      const userIds = [1];
      const servicePosts = [mockPost];

      jest
        .spyOn(postService, 'findAllByUserIds')
        .mockResolvedValue(servicePosts);

      // First call
      const result1 = await loader.findPostsByUserIds.loadMany(userIds);

      // Second call should use cache
      const result2 = await loader.findPostsByUserIds.loadMany(userIds);

      expect(result1).toEqual(result2);
      expect(postService.findAllByUserIds).toHaveBeenCalledTimes(1);
    });

    it('should cache results for findPostsByTagIds', async () => {
      const tagIds = [1];
      const servicePosts = [mockPost];

      jest
        .spyOn(postService, 'findAllByTagIds')
        .mockResolvedValue(servicePosts);

      // First call
      const result1 = await loader.findPostsByTagIds.loadMany(tagIds);

      // Second call should use cache
      const result2 = await loader.findPostsByTagIds.loadMany(tagIds);

      expect(result1).toEqual(result2);
      expect(postService.findAllByTagIds).toHaveBeenCalledTimes(1);
    });
  });
});
