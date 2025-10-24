/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import { Post } from '../../post/entities/post.entity';
import { Tag } from '../entities/tag.entity';
import { TagLoader } from '../tag.loader';
import { TagService } from '../tag.service';

describe('TagLoader', () => {
  let loader: TagLoader;
  let tagService: TagService;

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: Promise.resolve({ id: 1, email: 'test@test.com' } as any),
    tags: [],
  };

  const mockTag: Tag = {
    id: 1,
    name: 'Test Tag',
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: Promise.resolve([mockPost]),
  };

  const mockTag2: Tag = {
    id: 2,
    name: 'Test Tag 2',
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: Promise.resolve([mockPost]),
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagLoader,
        {
          provide: TagService,
          useValue: {
            findAllByIds: jest.fn(),
            findAllByPostIds: jest.fn(),
          },
        },
      ],
    }).compile();

    loader = await module.resolve<TagLoader>(TagLoader);
    tagService = module.get<TagService>(TagService);

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

  describe('findTagsByTagId', () => {
    it('should return tags by tag ids', async () => {
      const tagIds = [1, 2];
      const expectedTags = [mockTag, mockTag2];

      jest.spyOn(tagService, 'findAllByIds').mockResolvedValue(expectedTags);

      const result = await loader.findTagsByTagId.loadMany(tagIds);

      expect(result).toEqual(expectedTags);
      expect(tagService.findAllByIds).toHaveBeenCalledWith(
        tagIds,
        mockGraphQLResolveInfo,
      );
    });

    it('should return tags in the same order as requested ids', async () => {
      const tagIds = [2, 1];
      const serviceTags = [mockTag2, mockTag];

      jest.spyOn(tagService, 'findAllByIds').mockResolvedValue(serviceTags);

      const result = await loader.findTagsByTagId.loadMany(tagIds);

      expect(result).toEqual([mockTag2, mockTag]);
    });

    it('should throw error when tag is not found', async () => {
      const tagIds = [1, 999];
      const serviceTags = [mockTag];

      jest.spyOn(tagService, 'findAllByIds').mockResolvedValue(serviceTags);

      const result = await loader.findTagsByTagId.loadMany(tagIds);

      // DataLoader returns an array with errors for missing items
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Error);
      expect(result[1]).toBeInstanceOf(Error);
      expect((result[0] as Error).message).toBe('Tag with id 999 not found');
      expect((result[1] as Error).message).toBe('Tag with id 999 not found');
    });

    it('should handle empty tag ids array', async () => {
      const tagIds: number[] = [];

      jest.spyOn(tagService, 'findAllByIds').mockResolvedValue([]);

      const result = await loader.findTagsByTagId.loadMany(tagIds);

      expect(result).toEqual([]);

      // DataLoader doesn't call the batch function for empty arrays
      expect(tagService.findAllByIds).not.toHaveBeenCalled();
    });
  });

  describe('findTagsByPostIds', () => {
    it('should return tags grouped by post ids', async () => {
      const postIds = [1, 2];
      const serviceTags = [mockTag, mockTag2];

      jest.spyOn(tagService, 'findAllByPostIds').mockResolvedValue(serviceTags);

      const result = await loader.findTagsByPostIds.loadMany(postIds);

      expect(result).toEqual([[mockTag, mockTag2], []]);
      expect(tagService.findAllByPostIds).toHaveBeenCalledWith(
        postIds,
        mockGraphQLResolveInfo,
      );
    });

    it('should return empty arrays for posts with no tags', async () => {
      const postIds = [1, 2];
      const serviceTags: Tag[] = [];

      jest.spyOn(tagService, 'findAllByPostIds').mockResolvedValue(serviceTags);

      const result = await loader.findTagsByPostIds.loadMany(postIds);

      expect(result).toEqual([[], []]);
    });

    it('should handle empty post ids array', async () => {
      const postIds: number[] = [];

      jest.spyOn(tagService, 'findAllByPostIds').mockResolvedValue([]);

      const result = await loader.findTagsByPostIds.loadMany(postIds);

      expect(result).toEqual([]);

      // DataLoader doesn't call the batch function for empty arrays
      expect(tagService.findAllByPostIds).not.toHaveBeenCalled();
    });

    it('should group tags correctly by post id', async () => {
      const postIds = [1, 2];
      const post1 = { ...mockPost, id: 1 };
      const post2 = { ...mockPost, id: 2 };
      const tag1 = { ...mockTag, id: 1, posts: Promise.resolve([post1]) };
      const tag2 = { ...mockTag2, id: 2, posts: Promise.resolve([post2]) };
      const serviceTags = [tag1, tag2];

      jest.spyOn(tagService, 'findAllByPostIds').mockResolvedValue(serviceTags);

      const result = await loader.findTagsByPostIds.loadMany(postIds);

      expect(result).toEqual([[tag1], [tag2]]);
    });
  });

  describe('DataLoader caching', () => {
    it('should cache results for findTagsByTagId', async () => {
      const tagIds = [1];
      const expectedTags = [mockTag];

      jest.spyOn(tagService, 'findAllByIds').mockResolvedValue(expectedTags);

      // First call
      const result1 = await loader.findTagsByTagId.loadMany(tagIds);

      // Second call should use cache
      const result2 = await loader.findTagsByTagId.loadMany(tagIds);

      expect(result1).toEqual(result2);
      expect(tagService.findAllByIds).toHaveBeenCalledTimes(1);
    });

    it('should cache results for findTagsByPostIds', async () => {
      const postIds = [1];
      const serviceTags = [mockTag];

      jest.spyOn(tagService, 'findAllByPostIds').mockResolvedValue(serviceTags);

      // First call
      const result1 = await loader.findTagsByPostIds.loadMany(postIds);

      // Second call should use cache
      const result2 = await loader.findTagsByPostIds.loadMany(postIds);

      expect(result1).toEqual(result2);
      expect(tagService.findAllByPostIds).toHaveBeenCalledTimes(1);
    });
  });
});
