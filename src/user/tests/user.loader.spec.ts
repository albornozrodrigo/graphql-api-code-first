/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import '../../__mock__/pagination';
import { Role } from '../../enums/role.enum';
import { UserLoader } from '../user.loader';
import { UserService } from '../user.service';

describe('UserLoader', () => {
  let loader: UserLoader;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    id: 1,
    name: 'Rodrigo Albornoz',
    email: 'rodrigo@example.com',
    password: 'hashedPassword123',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: Promise.resolve([]),
    profile: Promise.resolve({} as any),
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLoader,
        {
          provide: UserService,
          useValue: {
            findAllByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    loader = await module.resolve<UserLoader>(UserLoader);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
  });

  describe('setInfo', () => {
    it('should set GraphQL resolve info and return loader instance', () => {
      const result = loader.setInfo(mockGraphQLResolveInfo);

      expect(result).toBe(loader);
    });
  });

  describe('findUsersByUserId', () => {
    beforeEach(() => {
      loader.setInfo(mockGraphQLResolveInfo);
    });

    it('should load single user by id', async () => {
      const userId = 1;
      const user = { ...mockUser };

      userService.findAllByIds.mockResolvedValue([user]);

      const result = await loader.findUsersByUserId.load(userId);

      expect(userService.findAllByIds).toHaveBeenCalledWith(
        [userId],
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(user);
    });

    it('should cache results for same user id', async () => {
      const userId = 1;
      const user = { ...mockUser };

      userService.findAllByIds.mockResolvedValue([user]);

      // First call
      const result1 = await loader.findUsersByUserId.load(userId);

      // Second call should use cache
      const result2 = await loader.findUsersByUserId.load(userId);

      expect(userService.findAllByIds).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(user);
      expect(result2).toEqual(user);
    });
  });
});
