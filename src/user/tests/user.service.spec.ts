/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GraphQLResolveInfo } from 'graphql';
import { In } from 'typeorm';
import '../../__mock__/pagination';
import { PaginationInput } from '../../common/dto/pagination.input';
import { Role } from '../../enums/role.enum';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserPasswordInput } from '../dto/update-user-password.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { User } from '../entities/user.entity';
import { UserService } from '../user.service';

jest.mock('../../app.utils', () => ({
  getAttributes: jest.fn(() => ['id', 'name', 'email']),
  buildPagination: jest.fn((pagination: { page: number; limit: number }) => ({
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
  })),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: {
    count: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    findOneByOrFail: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockUser = {
    id: 1,
    name: 'Rodrigo Albornoz',
    email: 'rodrigo@example.com',
    password: 'hashedPassword123',
    role: Role.USER,
  };

  const mockCreateUserInput: CreateUserInput = {
    name: 'Rodrigo Albornoz',
    email: 'rodrigo@example.com',
    password: 'password123',
    role: Role.USER,
  };

  const mockUpdateUserInput: UpdateUserInput = {
    name: 'Rodrigo Albornoz Figueiredo',
  };

  const mockUpdateUserPasswordInput: UpdateUserPasswordInput = {
    password: 'newPassword123',
  };

  const mockPaginationInput: PaginationInput = {
    limit: 10,
    page: 1,
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneByOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      userRepository.count.mockResolvedValue(0);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(mockCreateUserInput);

      expect(userRepository.count).toHaveBeenCalledWith({
        where: { email: mockCreateUserInput.email },
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockCreateUserInput.name,
          email: mockCreateUserInput.email,
          password: expect.any(String),
          role: Role.USER,
        }),
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw error when user already exists', async () => {
      userRepository.count.mockResolvedValue(1);

      await expect(service.create(mockCreateUserInput)).rejects.toThrow(
        'User already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      const users = [mockUser];
      userRepository.find.mockResolvedValue(users);

      const result = await service.findAll(
        mockGraphQLResolveInfo,
        mockPaginationInput,
      );

      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findAllByIds', () => {
    it('should return users by ids', async () => {
      const users = [mockUser];

      userRepository.find.mockResolvedValue(users);

      const result = await service.findAllByIds([1, 2], mockGraphQLResolveInfo);

      expect(userRepository.find).toHaveBeenCalledWith({
        where: {
          id: In([1, 2]),
        },
        select: ['id', 'name', 'email'],
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1, mockGraphQLResolveInfo);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'name', 'email'],
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(999, mockGraphQLResolveInfo),
      ).rejects.toThrow('User not found');
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneById(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: {
          profile: true,
        },
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(999)).rejects.toThrow('User not found');
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('rodrigo@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'rodrigo@example.com' },
        relations: {
          profile: true,
        },
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByEmail('notfound@example.com'),
      ).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const updatedUser = { ...mockUser, name: 'Rodrigo Albornoz Figueiredo' };

      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, mockUpdateUserInput);

      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);

      expect(result).toEqual(updatedUser);
    });

    it('should throw error when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, mockUpdateUserInput)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.updatePassword(
        1,
        mockUpdateUserPasswordInput,
      );

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.any(String),
        }),
      );

      expect(result).toBe(true);
    });

    it('should throw error when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, mockUpdateUserInput)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      userRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(userRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false when removal fails', async () => {
      userRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.remove(1);

      expect(result).toBe(false);
    });
  });

  describe('handleHashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const result = await service.handleHashPassword(password);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(password);
    });
  });
});
