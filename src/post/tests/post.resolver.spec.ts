/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import { mockPost, mockUser } from '../../__mock__';
import { Role } from '../../enums/role.enum';
import { TagLoader } from '../../tag/tag.loader';
import { UserLoader } from '../../user/user.loader';
import { CreatePostInput } from '../dto/create-post.input';
import { UpdatePostInput } from '../dto/update-post.input';
import { PostLoader } from '../post.loader';
import { PostResolver } from '../post.resolver';
import { PostService } from '../post.service';

describe('PostResolver', () => {
  let resolver: PostResolver;
  let postService: PostService;
  let userLoader: UserLoader;
  let tagLoader: TagLoader;

  const mockCreatePostInput: CreatePostInput = {
    title: 'New Post',
    content: 'New Content',
    tagIds: [1, 2],
  };

  const mockUpdatePostInput: UpdatePostInput = {
    title: 'Updated Post',
    content: 'Updated Content',
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostResolver,
        {
          provide: PostService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findAllByUserId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UserLoader,
          useValue: {
            setInfo: jest.fn().mockReturnThis(),
            findUsersByPostId: {
              load: jest.fn(),
            },
          },
        },
        {
          provide: PostLoader,
          useValue: {
            setInfo: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: TagLoader,
          useValue: {
            setInfo: jest.fn().mockReturnThis(),
            findTagsByPostIds: {
              load: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    resolver = module.get<PostResolver>(PostResolver);
    postService = module.get<PostService>(PostService);
    userLoader = module.get<UserLoader>(UserLoader);
    tagLoader = module.get<TagLoader>(TagLoader);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const expectedPosts = [mockPost];
      jest.spyOn(postService, 'findAll').mockResolvedValue(expectedPosts);

      const result = await resolver.findAll(mockGraphQLResolveInfo);

      expect(result).toEqual(expectedPosts);
      expect(postService.findAll).toHaveBeenCalledWith(
        mockGraphQLResolveInfo,
        undefined,
      );
    });

    it('should return all posts with pagination', async () => {
      const pagination = { page: 1, limit: 10 };
      const expectedPosts = [mockPost];
      jest.spyOn(postService, 'findAll').mockResolvedValue(expectedPosts);

      const result = await resolver.findAll(mockGraphQLResolveInfo, pagination);

      expect(result).toEqual(expectedPosts);
      expect(postService.findAll).toHaveBeenCalledWith(
        mockGraphQLResolveInfo,
        pagination,
      );
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const postId = 1;
      jest.spyOn(postService, 'findOne').mockResolvedValue(mockPost);

      const result = await resolver.findOne(postId, mockGraphQLResolveInfo);

      expect(result).toEqual(mockPost);
      expect(postService.findOne).toHaveBeenCalledWith(
        postId,
        mockGraphQLResolveInfo,
      );
    });
  });

  describe('findAllByUserId', () => {
    it('should return posts by user id', async () => {
      const expectedPosts = [mockPost];
      jest
        .spyOn(postService, 'findAllByUserId')
        .mockResolvedValue(expectedPosts);

      const result = await resolver.findAllByUserId(
        mockUser,
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(expectedPosts);
      expect(postService.findAllByUserId).toHaveBeenCalledWith(
        mockUser.id,
        mockGraphQLResolveInfo,
        undefined,
      );
    });

    it('should return posts by user id with pagination', async () => {
      const pagination = { page: 1, limit: 10 };
      const expectedPosts = [mockPost];
      jest
        .spyOn(postService, 'findAllByUserId')
        .mockResolvedValue(expectedPosts);

      const result = await resolver.findAllByUserId(
        mockUser,
        mockGraphQLResolveInfo,
        pagination,
      );

      expect(result).toEqual(expectedPosts);
      expect(postService.findAllByUserId).toHaveBeenCalledWith(
        mockUser.id,
        mockGraphQLResolveInfo,
        pagination,
      );
    });
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const expectedPost = { ...mockPost, ...mockCreatePostInput };
      jest.spyOn(postService, 'create').mockResolvedValue(expectedPost);

      const result = await resolver.create(mockUser, mockCreatePostInput);

      expect(result).toEqual(expectedPost);
      expect(postService.create).toHaveBeenCalledWith(
        mockUser.id,
        mockCreatePostInput,
      );
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const postId = 1;
      const expectedPost = { ...mockPost, ...mockUpdatePostInput };
      jest.spyOn(postService, 'update').mockResolvedValue(expectedPost);

      const result = await resolver.update(
        mockUser,
        postId,
        mockUpdatePostInput,
      );

      expect(result).toEqual(expectedPost);
      expect(postService.update).toHaveBeenCalledWith(
        postId,
        mockUser.id,
        mockUpdatePostInput,
      );
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const postId = 1;
      jest.spyOn(postService, 'remove').mockResolvedValue(true);

      const result = await resolver.remove(mockUser, postId);

      expect(result).toBe(true);
      expect(postService.remove).toHaveBeenCalledWith(postId, mockUser.id);
    });
  });

  describe('user field resolver', () => {
    it('should return user for post', async () => {
      const mockUserFromLoader = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        role: Role.USER,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: undefined,
        posts: Promise.resolve([]),
      };
      jest.spyOn(userLoader, 'setInfo').mockReturnThis();
      jest
        .spyOn(userLoader.findUsersByPostId, 'load')
        .mockResolvedValue(mockUserFromLoader);

      const result = await resolver.user(mockPost, mockGraphQLResolveInfo);

      expect(result).toEqual(mockUserFromLoader);
      expect(userLoader.setInfo).toHaveBeenCalledWith(mockGraphQLResolveInfo);
      expect(userLoader.findUsersByPostId.load).toHaveBeenCalledWith(
        mockPost.id,
      );
    });

    it('should return null for null post', async () => {
      const result = await resolver.user(null as any, mockGraphQLResolveInfo);

      expect(result).toBeNull();
    });
  });

  describe('tags field resolver', () => {
    it('should return tags for post', async () => {
      const mockTagFromLoader = {
        id: 1,
        name: 'Test Tag',
        createdAt: new Date(),
        updatedAt: new Date(),
        posts: Promise.resolve([]),
      };
      jest.spyOn(tagLoader, 'setInfo').mockReturnThis();
      jest
        .spyOn(tagLoader.findTagsByPostIds, 'load')
        .mockResolvedValue([mockTagFromLoader]);

      const result = await resolver.tags(mockPost, mockGraphQLResolveInfo);

      expect(result).toEqual([mockTagFromLoader]);
      expect(tagLoader.setInfo).toHaveBeenCalledWith(mockGraphQLResolveInfo);
      expect(tagLoader.findTagsByPostIds.load).toHaveBeenCalledWith(
        mockPost.id,
      );
    });

    it('should return empty array for undefined post', async () => {
      const result = await resolver.tags(
        undefined as any,
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual([]);
    });

    it('should return empty array for null post', async () => {
      const result = await resolver.tags(null as any, mockGraphQLResolveInfo);

      expect(result).toEqual([]);
    });
  });
});
