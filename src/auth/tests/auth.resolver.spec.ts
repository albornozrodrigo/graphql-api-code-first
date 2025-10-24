/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../../enums/role.enum';
import { AuthResolver } from '../auth.resolver';
import { AuthService } from '../auth.service';
import { AuthInput } from '../dto/auth.input';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(() => ({ access_token: 'token' })),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    it('should return an AuthResponse when user is valid', async () => {
      const authInput: AuthInput = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: Role.USER,
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(user);

      const result = await resolver.login(authInput);

      expect(result).toEqual({
        access_token: expect.any(String),
      });
    });

    it('should throw an error when user is invalid', async () => {
      const authInput: AuthInput = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(resolver.login(authInput)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
