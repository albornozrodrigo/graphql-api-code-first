/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  mockInfo,
  mockPagination,
  mockProfile,
  mockProfiles,
  mockUser,
} from '../../__mock__';
import { CreateProfileInput } from '../dto/create-profile.input';
import { UpdateProfileInput } from '../dto/update-profile.input';
import { Profile } from '../entities/profile.entity';
import { ProfileService } from '../profile.service';

jest.mock('../../app.utils', () => ({
  getAttributes: jest.fn(() => ({ id: true })),
  buildPagination: jest.fn((pagination: { page: number; limit: number }) => ({
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
  })),
}));

describe('ProfileService', () => {
  let service: ProfileService;
  let repository: Repository<Profile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(Profile),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    repository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new profile', async () => {
      const createProfileInput: CreateProfileInput = {
        bio: 'test bio',
        avatar: 'test avatar',
      };
      jest.spyOn(repository, 'count').mockResolvedValue(0);
      jest.spyOn(repository, 'create').mockReturnValue(mockProfile);
      jest.spyOn(repository, 'save').mockResolvedValue(mockProfile);

      const result = await service.create(mockUser.id, createProfileInput);
      expect(result).toEqual(mockProfile);
      expect(repository.count).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
      expect(repository.create).toHaveBeenCalledWith({
        ...createProfileInput,
        user: { id: mockUser.id },
      });
      expect(repository.save).toHaveBeenCalledWith(mockProfile);
    });

    it('should throw an error if profile already exists', async () => {
      const createProfileInput: CreateProfileInput = {
        bio: 'test bio',
        avatar: 'test avatar',
      };
      jest.spyOn(repository, 'count').mockResolvedValue(1);

      await expect(
        service.create(mockUser.id, createProfileInput),
      ).rejects.toThrow('Profile already exists');
    });
  });

  describe('findAll', () => {
    it('should return an array of profiles', async () => {
      const profiles = [mockProfile, mockProfile];
      jest.spyOn(repository, 'find').mockResolvedValue(profiles);

      const result = await service.findAll(mockInfo, mockPagination);
      expect(result).toEqual(profiles);
    });
  });

  describe('findAllByIds', () => {
    it('should return an array of profiles by ids', async () => {
      const profiles = mockProfiles(2);
      const ids = profiles.map((p) => p.id);
      jest.spyOn(repository, 'find').mockResolvedValue(profiles);

      const result = await service.findAllByIds(ids, mockInfo);
      expect(result).toEqual(profiles);
      expect(repository.find).toHaveBeenCalledWith({
        select: { id: true },
        where: { id: In(ids) },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findAllByUserIds', () => {
    it('should return an array of profiles by user ids', async () => {
      const profiles = mockProfiles(2);
      const userIds = await Promise.all(
        profiles.map(async (p) => (await p.user).id),
      );
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(profiles),
      };
      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAllByUserIds(userIds, mockInfo);
      expect(result).toEqual(profiles);
    });
  });

  describe('findOne', () => {
    it('should return a single profile', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProfile);

      const result = await service.findOne(mockProfile.id, mockInfo);
      expect(result).toEqual(mockProfile);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockProfile.id },
        select: { id: true },
      });
    });

    it('should throw an error if profile not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(99, mockInfo)).rejects.toThrow(
        'Profile not found',
      );
    });
  });

  describe('findOneByUserId', () => {
    it('should return a single profile by user id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProfile);

      const result = await service.findOneByUserId(mockUser.id, mockInfo);
      expect(result).toEqual(mockProfile);
    });

    it('should throw an error if profile not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneByUserId(99, mockInfo)).rejects.toThrow(
        'Profile not found',
      );
    });
  });

  describe('update', () => {
    const updateProfileInput: UpdateProfileInput = {
      bio: 'new bio',
    };
    it('should update a profile', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProfile);
      jest.spyOn(repository, 'save').mockResolvedValue(mockProfile);

      const result = await service.update(
        mockProfile.id,
        mockUser.id,
        updateProfileInput,
      );
      expect(result).toEqual(mockProfile);
    });

    it('should throw an error if profile not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update(99, mockUser.id, updateProfileInput),
      ).rejects.toThrow('Profile not found');
    });

    it('should throw an error if user is not authorized', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProfile);

      await expect(
        service.update(mockProfile.id, 99, updateProfileInput),
      ).rejects.toThrow('You are not authorized to update this profile');
    });
  });

  describe('remove', () => {
    it('should remove a profile', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProfile);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(mockUser.id);
      expect(result).toEqual(true);
    });

    it('should throw an error if profile not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow('Profile not found');
    });

    it('should throw an error if user is not authorized', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProfile);

      await expect(service.remove(99)).rejects.toThrow(
        'You are not authorized to delete this profile',
      );
    });
  });
});
