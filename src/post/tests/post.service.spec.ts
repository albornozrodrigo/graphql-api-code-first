import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GraphQLResolveInfo } from 'graphql';
import { Repository } from 'typeorm';
import * as appUtils from '../../app.utils';
import { Role } from '../../enums/role.enum';
import { User } from '../../user/entities/user.entity';
import { CreatePostInput } from '../dto/create-post.input';
import { UpdatePostInput } from '../dto/update-post.input';
import { Post } from '../entities/post.entity';
import { PostService } from '../post.service';

describe('PostService', () => {
  let service: PostService;
  let postRepository: Repository<Post>;

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

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    // Mock the getAttributes function
    jest.spyOn(appUtils, 'getAttributes').mockReturnValue({});
    jest
      .spyOn(appUtils, 'buildPagination')
      .mockReturnValue({ limit: 10, offset: 0 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post successfully', async () => {
      const userId = 1;
      mockRepository.count.mockResolvedValue(0);
      mockRepository.create.mockReturnValue(mockPost);
      mockRepository.save.mockResolvedValue(mockPost);

      const result = await service.create(userId, mockCreatePostInput);

      expect(result).toEqual(mockPost);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { title: mockCreatePostInput.title },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...mockCreatePostInput,
        user: { id: userId },
        tags: [{ id: 1 }, { id: 2 }],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockPost);
    });

    it('should throw error when title already exists', async () => {
      const userId = 1;
      mockRepository.count.mockResolvedValue(1);

      await expect(service.create(userId, mockCreatePostInput)).rejects.toThrow(
        'Title already used',
      );
    });

    it('should create post without tags when tagIds is not provided', async () => {
      const userId = 1;
      const inputWithoutTags = { title: 'New Post', content: 'New Content' };
      mockRepository.count.mockResolvedValue(0);
      mockRepository.create.mockReturnValue(mockPost);
      mockRepository.save.mockResolvedValue(mockPost);

      await service.create(userId, inputWithoutTags);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...inputWithoutTags,
        user: { id: userId },
        tags: [],
      });
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const expectedPosts = [mockPost];
      mockRepository.find.mockResolvedValue(expectedPosts);

      const result = await service.findAll(mockGraphQLResolveInfo);

      expect(result).toEqual(expectedPosts);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return posts with pagination', async () => {
      const pagination = { page: 1, limit: 10 };
      const expectedPosts = [mockPost];
      mockRepository.find.mockResolvedValue(expectedPosts);

      const result = await service.findAll(mockGraphQLResolveInfo, pagination);

      expect(result).toEqual(expectedPosts);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllByUserId', () => {
    it('should return posts by user id', async () => {
      const userId = 1;
      const expectedPosts = [mockPost];
      mockRepository.find.mockResolvedValue(expectedPosts);

      const result = await service.findAllByUserId(
        userId,
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(expectedPosts);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user: { id: userId } },
          relations: { user: true, tags: true },
        }),
      );
    });

    it('should return posts by user id with pagination', async () => {
      const userId = 1;
      const pagination = { page: 1, limit: 10 };
      const expectedPosts = [mockPost];
      mockRepository.find.mockResolvedValue(expectedPosts);

      const result = await service.findAllByUserId(
        userId,
        mockGraphQLResolveInfo,
        pagination,
      );

      expect(result).toEqual(expectedPosts);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllByIds', () => {
    it('should return posts by ids', async () => {
      const ids = [1, 2];
      const expectedPosts = [mockPost];
      mockRepository.find.mockResolvedValue(expectedPosts);

      const result = await service.findAllByIds(ids, mockGraphQLResolveInfo);

      expect(result).toEqual(expectedPosts);
      expect(mockRepository.find).toHaveBeenCalledWith({
        select: expect.any(Object),
        where: { id: expect.any(Object) },
        order: { createdAt: 'DESC' },
        relations: { user: true, tags: true },
      });
    });
  });

  describe('findAllByUserIds', () => {
    it('should return posts by user ids using query builder', async () => {
      const userIds = [1, 2];
      const expectedPosts = [mockPost];
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(expectedPosts);

      const result = await service.findAllByUserIds(
        userIds,
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(expectedPosts);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('post');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'post.user',
        'user',
        'user.id IN (:...userIds)',
        { userIds },
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.id');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('findAllByTagIds', () => {
    it('should return posts by tag ids using query builder', async () => {
      const tagIds = [1, 2];
      const expectedPosts = [mockPost];
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(expectedPosts);

      const result = await service.findAllByTagIds(
        tagIds,
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(expectedPosts);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('post');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'post.tags',
        'tag',
        'tag.id IN (:...tagIds)',
        { tagIds },
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('tag.id');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const postId = 1;
      mockRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(postId, mockGraphQLResolveInfo);

      expect(result).toEqual(mockPost);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        select: expect.any(Object),
        relations: { user: true, tags: true },
      });
    });

    it('should throw error when post is not found', async () => {
      const postId = 999;
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(postId, mockGraphQLResolveInfo),
      ).rejects.toThrow('Post not found');
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      const postId = 1;
      const userId = 1;
      const updatedPost = { ...mockPost, ...mockUpdatePostInput };

      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.save.mockResolvedValue(updatedPost);

      const result = await service.update(postId, userId, mockUpdatePostInput);

      expect(result).toEqual(updatedPost);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: { user: true, tags: true },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when post is not found', async () => {
      const postId = 999;
      const userId = 1;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(postId, userId, mockUpdatePostInput),
      ).rejects.toThrow('Post not found');
    });

    it('should throw error when user is not authorized', async () => {
      const postId = 1;
      const userId = 2; // Different user

      mockRepository.findOne.mockResolvedValue(mockPost);

      await expect(
        service.update(postId, userId, mockUpdatePostInput),
      ).rejects.toThrow('You are not authorized to update this post');
    });

    it('should update tags when tagIds is provided', async () => {
      const postId = 1;
      const userId = 1;
      const updateInputWithTags = { ...mockUpdatePostInput, tagIds: [3, 4] };
      const updatedPost = { ...mockPost, ...updateInputWithTags };

      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.save.mockResolvedValue(updatedPost);

      await service.update(postId, userId, updateInputWithTags);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: [{ id: 3 }, { id: 4 }],
        }),
      );
    });
  });

  describe('remove', () => {
    it('should remove a post successfully', async () => {
      const postId = 1;
      const userId = 1;

      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(postId, userId);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(mockRepository.delete).toHaveBeenCalledWith(postId);
    });

    it('should throw error when post is not found', async () => {
      const postId = 999;
      const userId = 1;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(postId, userId)).rejects.toThrow(
        'Post not found',
      );
    });

    it('should throw error when user is not authorized', async () => {
      const postId = 1;
      const userId = 2; // Different user

      mockRepository.findOne.mockResolvedValue(mockPost);

      await expect(service.remove(postId, userId)).rejects.toThrow(
        'You are not authorized to delete this post',
      );
    });

    it('should return false when deletion affects 0 rows', async () => {
      const postId = 1;
      const userId = 1;

      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.remove(postId, userId);

      expect(result).toBe(false);
    });
  });
});
