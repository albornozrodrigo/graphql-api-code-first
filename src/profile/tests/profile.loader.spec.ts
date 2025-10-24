/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { mockInfo, mockProfiles, mockUser } from '../../__mock__';
import { Profile } from '../entities/profile.entity';
import { ProfileLoader } from '../profile.loader';
import { ProfileService } from '../profile.service';

describe('ProfileLoader', () => {
  let loader: ProfileLoader;
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileLoader,
        {
          provide: ProfileService,
          useValue: {
            findAllByUserIds: jest.fn(),
          },
        },
      ],
    }).compile();

    loader = await module.resolve<ProfileLoader>(ProfileLoader);
    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
  });

  describe('findProfilesByUserIds', () => {
    it('should return profiles for given user ids', async () => {
      const usersIds = [mockUser.id, mockUser.id + 1];
      const profiles: Profile[] = mockProfiles(usersIds.length);

      (service.findAllByUserIds as jest.Mock).mockResolvedValue(profiles);

      const result = await loader
        .setInfo(mockInfo)
        .findProfilesByUserIds.loadMany(usersIds);

      expect(service.findAllByUserIds).toHaveBeenCalledWith(usersIds, mockInfo);
      expect(result).toHaveLength(usersIds.length);
    });

    it('should return two errors if no profiles are found', async () => {
      const userIds = [1, 2];

      (service.findAllByUserIds as jest.Mock).mockResolvedValue([]);

      const result = await loader
        .setInfo(mockInfo)
        .findProfilesByUserIds.loadMany(userIds);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Error);
      expect(result[1]).toBeInstanceOf(Error);
    });
  });
});
