/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockInfo,
  mockPagination,
  mockProfile,
  mockUser,
} from '../../__mock__';
import { UserLoader } from '../../user/user.loader';
import { CreateProfileInput } from '../dto/create-profile.input';
import { UpdateProfileInput } from '../dto/update-profile.input';
import { ProfileResolver } from '../profile.resolver';
import { ProfileService } from '../profile.service';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;
  let service: ProfileService;
  let userLoader: UserLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileResolver,
        {
          provide: ProfileService,
          useValue: {
            findAll: vi.fn(),
            findOne: vi.fn(),
            findOneByUserId: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
        {
          provide: UserLoader,
          useValue: {
            setInfo: vi.fn().mockReturnThis(),
            findUsersByUserId: {
              load: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    resolver = module.get<ProfileResolver>(ProfileResolver);
    service = module.get<ProfileService>(ProfileService);
    userLoader = module.get<UserLoader>(UserLoader);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('allProfiles', () => {
    it('should return an array of profiles', async () => {
      const profiles = [mockProfile, mockProfile];
      (service.findAll as Mock).mockResolvedValue(profiles);

      const result = await resolver.findAll(mockInfo, mockPagination);
      expect(result).toEqual(profiles);
      expect(service.findAll).toHaveBeenCalledWith(mockInfo, mockPagination);
    });
  });

  describe('profile', () => {
    it('should return a single profile', async () => {
      (service.findOne as Mock).mockResolvedValue(mockProfile);

      const result = await resolver.findOne(mockProfile.id, mockInfo);
      expect(result).toEqual(mockProfile);
      expect(service.findOne).toHaveBeenCalledWith(mockProfile.id, mockInfo);
    });
  });

  describe('profileByUserId', () => {
    it('should return a single profile by user id', async () => {
      (service.findOneByUserId as Mock).mockResolvedValue(mockProfile);

      const result = await resolver.findOneByUserId(mockUser, mockInfo);
      expect(result).toEqual(mockProfile);
      expect(service.findOneByUserId).toHaveBeenCalledWith(
        mockUser.id,
        mockInfo,
      );
    });
  });

  describe('createProfile', () => {
    it('should create a new profile', async () => {
      const createProfileInput: CreateProfileInput = {
        bio: 'test bio',
        avatar: 'test avatar',
      };
      (service.create as Mock).mockResolvedValue(mockProfile);

      const result = await resolver.create(mockUser, createProfileInput);
      expect(result).toEqual(mockProfile);
      expect(service.create).toHaveBeenCalledWith(
        mockUser.id,
        createProfileInput,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update a profile', async () => {
      const updateProfileInput: UpdateProfileInput = {
        bio: 'new bio',
      };
      (service.update as Mock).mockResolvedValue(mockProfile);

      const result = await resolver.updateProfile(
        mockUser,
        mockProfile.id,
        updateProfileInput,
      );
      expect(result).toEqual(mockProfile);
      expect(service.update).toHaveBeenCalledWith(
        mockProfile.id,
        mockUser.id,
        updateProfileInput,
      );
    });
  });

  describe('removeProfile', () => {
    it('should remove a profile', async () => {
      (service.remove as Mock).mockResolvedValue(true);

      const result = await resolver.removeProfile(mockUser);
      expect(result).toEqual(true);
      expect(service.remove).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('user', () => {
    it('should return the user for a profile', async () => {
      (userLoader.findUsersByUserId.load as Mock).mockResolvedValue(mockUser);

      const result = await resolver.user(mockProfile, mockInfo);
      expect(result).toEqual(mockUser);
      expect(userLoader.setInfo).toHaveBeenCalledWith(mockInfo);
      expect(userLoader.findUsersByUserId.load).toHaveBeenCalledWith(
        mockUser.id,
      );
    });

    it('should return null if profile is null', async () => {
      // @ts-expect-error not null
      const result = await resolver.user(null, mockInfo);
      expect(result).toBeNull();
    });
  });
});
