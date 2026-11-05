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
import { describe, it, expect, beforeEach, vi } from 'vitest';

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
            findAll: vi.fn(),
            findOne: vi.fn(),
            findAllByPostId: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
        {
          provide: PostLoader,
          useValue: {
            setInfo: vi.fn().mockReturnThis(),
            findPostsByTagIds: {
              load: vi.fn(),
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
      vi.spyOn(tagService, 'findAll').mockResolvedValue(expectedTags);

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
      vi.spyOn(tagService, 'findAll').mockResolvedValue(expectedTags);

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
      vi.spyOn(tagService, 'findOne').mockResolvedValue(mockTag);

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
      vi.spyOn(tagService, 'findAllByPostId').mockResolvedValue(expectedTags);

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
      vi.spyOn(tagService, 'findAllByPostId').mockResolvedValue(expectedTags);

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
      vi.spyOn(tagService, 'create').mockResolvedValue(expectedTag);

      const result = await resolver.create(mockCreateTagInput);

      expect(result).toEqual(expectedTag);
      expect(tagService.create).toHaveBeenCalledWith(mockCreateTagInput);
    });
  });

  describe('updateTag', () => {
    it('should update a tag', async () => {
      const tagId = 1;
      const expectedTag = { ...mockTag, ...mockUpdateTagInput };
      vi.spyOn(tagService, 'update').mockResolvedValue(expectedTag);

      const result = await resolver.updateTag(tagId, mockUpdateTagInput);

      expect(result).toEqual(expectedTag);
      expect(tagService.update).toHaveBeenCalledWith(tagId, mockUpdateTagInput);
    });
  });

  describe('removeTag', () => {
    it('should remove a tag', async () => {
      const tagId = 1;
      vi.spyOn(tagService, 'remove').mockResolvedValue(true);

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
      vi.spyOn(postLoader, 'setInfo').mockReturnThis();
      vi.spyOn(postLoader.findPostsByTagIds, 'load').mockResolvedValue(
        mockPosts,
      );

      const result = await resolver.posts(mockTag, mockGraphQLResolveInfo);

      expect(result).toEqual(mockPosts);
      expect(postLoader.setInfo).toHaveBeenCalledWith(mockGraphQLResolveInfo);
      expect(postLoader.findPostsByTagIds.load).toHaveBeenCalledWith(
        mockTag.id,
      );
    });

    it('should return null for null tag', async () => {
      const result = await resolver.posts(null as any, mockGraphQLResolveInfo);

      expect(result).toBeNull();
    });
  });
});
