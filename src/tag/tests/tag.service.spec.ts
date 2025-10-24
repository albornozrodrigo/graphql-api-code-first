/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GraphQLResolveInfo } from 'graphql';
import { Repository } from 'typeorm';
import * as appUtils from '../../app.utils';
import { CreateTagInput } from '../dto/create-tag.input';
import { UpdateTagInput } from '../dto/update-tag.input';
import { Tag } from '../entities/tag.entity';
import { TagService } from '../tag.service';

describe('TagService', () => {
  let service: TagService;
  let tagRepository: Repository<Tag>;

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
        TagService,
        {
          provide: getRepositoryToken(Tag),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    tagRepository = module.get<Repository<Tag>>(getRepositoryToken(Tag));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tag successfully', async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.create.mockReturnValue(mockTag);
      mockRepository.save.mockResolvedValue(mockTag);

      const result = await service.create(mockCreateTagInput);

      expect(result).toEqual(mockTag);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { name: mockCreateTagInput.name },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateTagInput);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTag);
    });

    it('should throw error when tag name already exists', async () => {
      mockRepository.count.mockResolvedValue(1);

      await expect(service.create(mockCreateTagInput)).rejects.toThrow(
        'Tag already used',
      );
    });
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      const expectedTags = [mockTag];
      mockRepository.find.mockResolvedValue(expectedTags);

      const result = await service.findAll(mockGraphQLResolveInfo);

      expect(result).toEqual(expectedTags);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return tags with pagination', async () => {
      const pagination = { page: 1, limit: 10 };
      const expectedTags = [mockTag];
      mockRepository.find.mockResolvedValue(expectedTags);

      const result = await service.findAll(mockGraphQLResolveInfo, pagination);

      expect(result).toEqual(expectedTags);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllByPostId', () => {
    it('should return tags by post id', async () => {
      const postId = 1;
      const expectedTags = [mockTag];
      mockRepository.find.mockResolvedValue(expectedTags);

      const result = await service.findAllByPostId(
        postId,
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(expectedTags);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { posts: { id: postId } },
          relations: { posts: true },
        }),
      );
    });

    it('should return tags by post id with pagination', async () => {
      const postId = 1;
      const pagination = { page: 1, limit: 10 };
      const expectedTags = [mockTag];
      mockRepository.find.mockResolvedValue(expectedTags);

      const result = await service.findAllByPostId(
        postId,
        mockGraphQLResolveInfo,
        pagination,
      );

      expect(result).toEqual(expectedTags);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllByPostIds', () => {
    it('should return tags by post ids using query builder', async () => {
      const postIds = [1, 2];
      const expectedTags = [mockTag];
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(expectedTags);

      const result = await service.findAllByPostIds(
        postIds,
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(expectedTags);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('tag');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'tag.posts',
        'post',
        'post.id IN (:...postIds)',
        { postIds },
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('tag.id');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('findAllByIds', () => {
    it('should return tags by ids', async () => {
      const ids = [1, 2];
      const expectedTags = [mockTag];
      mockRepository.find.mockResolvedValue(expectedTags);

      const result = await service.findAllByIds(ids, mockGraphQLResolveInfo);

      expect(result).toEqual(expectedTags);
      expect(mockRepository.find).toHaveBeenCalledWith({
        select: expect.any(Object),
        where: { id: expect.any(Object) },
        order: { createdAt: 'DESC' },
        relations: { posts: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      const tagId = 1;
      mockRepository.findOne.mockResolvedValue(mockTag);

      const result = await service.findOne(tagId, mockGraphQLResolveInfo);

      expect(result).toEqual(mockTag);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: tagId },
        select: expect.any(Object),
        relations: { posts: true },
      });
    });

    it('should throw error when tag is not found', async () => {
      const tagId = 999;
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(tagId, mockGraphQLResolveInfo),
      ).rejects.toThrow('Tag not found');
    });
  });

  describe('update', () => {
    it('should update a tag successfully', async () => {
      const tagId = 1;
      const updatedTag = { ...mockTag, ...mockUpdateTagInput };

      mockRepository.findOne.mockResolvedValue(mockTag);
      mockRepository.save.mockResolvedValue(updatedTag);

      const result = await service.update(tagId, mockUpdateTagInput);

      expect(result).toEqual(updatedTag);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: tagId },
        relations: { posts: true },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when tag is not found', async () => {
      const tagId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(tagId, mockUpdateTagInput)).rejects.toThrow(
        'Tag not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a tag successfully', async () => {
      const tagId = 1;

      mockRepository.findOne.mockResolvedValue(mockTag);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(tagId);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: tagId },
      });
      expect(mockRepository.delete).toHaveBeenCalledWith(tagId);
    });

    it('should throw error when tag is not found', async () => {
      const tagId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(tagId)).rejects.toThrow('Tag no found');
    });

    it('should return false when deletion affects 0 rows', async () => {
      const tagId = 1;

      mockRepository.findOne.mockResolvedValue(mockTag);
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.remove(tagId);

      expect(result).toBe(false);
    });
  });
});
