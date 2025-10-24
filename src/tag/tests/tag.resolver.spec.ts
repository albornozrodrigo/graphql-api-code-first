/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import { PostLoader } from '../../post/post.loader';
import { CreateTagInput } from '../dto/create-tag.input';
import { UpdateTagInput } from '../dto/update-tag.input';
import { Tag } from '../entities/tag.entity';
import { TagResolver } from '../tag.resolver';
import { TagService } from '../tag.service';

describe('TagResolver', () => {
  let resolver: TagResolver;
  let tagService: TagService;
  let postLoader: PostLoader;

  const mockTag: Tag = {
    id: 1,
    name: 'Test Tag',
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: Promise.resolve([]),
  };

  const mockCreateTagInput: CreateTagInput = {
    name: 'New Tag',
    postId: 1,
  };

  const mockUpdateTagInput: UpdateTagInput = {
    name: 'Updated Tag',
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagResolver,
        {
          provide: TagService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findAllByPostId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: PostLoader,
          useValue: {
            setInfo: jest.fn().mockReturnThis(),
            findPostsByUserIds: {
              load: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    resolver = module.get<TagResolver>(TagResolver);
    tagService = module.get<TagService>(TagService);
    postLoader = module.get<PostLoader>(PostLoader);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      const expectedTags = [mockTag];
      jest.spyOn(tagService, 'findAll').mockResolvedValue(expectedTags);

      const result = await resolver.findAll(mockGraphQLResolveInfo);

      expect(result).toEqual(expectedTags);
      expect(tagService.findAll).toHaveBeenCalledWith(
        mockGraphQLResolveInfo,
        undefined,
      );
    });

    it('should return all tags with pagination', async () => {
      const pagination = { page: 1, limit: 10 };
      const expectedTags = [mockTag];
      jest.spyOn(tagService, 'findAll').mockResolvedValue(expectedTags);

      const result = await resolver.findAll(mockGraphQLResolveInfo, pagination);

      expect(result).toEqual(expectedTags);
      expect(tagService.findAll).toHaveBeenCalledWith(
        mockGraphQLResolveInfo,
        pagination,
      );
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      const tagId = 1;
      jest.spyOn(tagService, 'findOne').mockResolvedValue(mockTag);

      const result = await resolver.findOne(tagId, mockGraphQLResolveInfo);

      expect(result).toEqual(mockTag);
      expect(tagService.findOne).toHaveBeenCalledWith(
        tagId,
        mockGraphQLResolveInfo,
      );
    });
  });

  describe('findAllByPostId', () => {
    it('should return tags by post id', async () => {
      const postId = 1;
      const expectedTags = [mockTag];
      jest.spyOn(tagService, 'findAllByPostId').mockResolvedValue(expectedTags);

      const result = await resolver.findAllByPostId(
        postId,
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(expectedTags);
      expect(tagService.findAllByPostId).toHaveBeenCalledWith(
        postId,
        mockGraphQLResolveInfo,
        undefined,
      );
    });

    it('should return tags by post id with pagination', async () => {
      const postId = 1;
      const pagination = { page: 1, limit: 10 };
      const expectedTags = [mockTag];
      jest.spyOn(tagService, 'findAllByPostId').mockResolvedValue(expectedTags);

      const result = await resolver.findAllByPostId(
        postId,
        mockGraphQLResolveInfo,
        pagination,
      );

      expect(result).toEqual(expectedTags);
      expect(tagService.findAllByPostId).toHaveBeenCalledWith(
        postId,
        mockGraphQLResolveInfo,
        pagination,
      );
    });
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const expectedTag = { ...mockTag, ...mockCreateTagInput };
      jest.spyOn(tagService, 'create').mockResolvedValue(expectedTag);

      const result = await resolver.create(mockCreateTagInput);

      expect(result).toEqual(expectedTag);
      expect(tagService.create).toHaveBeenCalledWith(mockCreateTagInput);
    });
  });

  describe('updateTag', () => {
    it('should update a tag', async () => {
      const tagId = 1;
      const expectedTag = { ...mockTag, ...mockUpdateTagInput };
      jest.spyOn(tagService, 'update').mockResolvedValue(expectedTag);

      const result = await resolver.updateTag(tagId, mockUpdateTagInput);

      expect(result).toEqual(expectedTag);
      expect(tagService.update).toHaveBeenCalledWith(tagId, mockUpdateTagInput);
    });
  });

  describe('removeTag', () => {
    it('should remove a tag', async () => {
      const tagId = 1;
      jest.spyOn(tagService, 'remove').mockResolvedValue(true);

      const result = await resolver.removeTag(tagId);

      expect(result).toBe(true);
      expect(tagService.remove).toHaveBeenCalledWith(tagId);
    });
  });

  describe('posts field resolver', () => {
    it('should return posts for tag', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Test Post',
          content: 'Test Content',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: Promise.resolve({ id: 1, email: 'test@test.com' } as any),
          tags: [],
        },
      ];
      jest.spyOn(postLoader, 'setInfo').mockReturnThis();
      jest
        .spyOn(postLoader.findPostsByUserIds, 'load')
        .mockResolvedValue(mockPosts);

      const result = await resolver.posts(mockTag, mockGraphQLResolveInfo);

      expect(result).toEqual(mockPosts);
      expect(postLoader.setInfo).toHaveBeenCalledWith(mockGraphQLResolveInfo);
      expect(postLoader.findPostsByUserIds.load).toHaveBeenCalledWith(
        mockTag.id,
      );
    });

    it('should return null for null tag', async () => {
      const result = await resolver.posts(null as any, mockGraphQLResolveInfo);

      expect(result).toBeNull();
    });
  });
});
