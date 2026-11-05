import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { JwtPayload } from './auth.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<
    User,
    'password' | 'createdAt' | 'updatedAt' | 'posts'
  > | null> {
    // Mesma mensagem para e-mail inexistente e senha errada (evita enumeração de usuários)
    const user: User | null = await this.userService
      .findOneByEmail(email)
      .catch(() => null);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async getUserById(userId: number) {
    return await this.userService.findOneById(userId);
  }

  login(user: Omit<User, 'password' | 'createdAt' | 'updatedAt' | 'posts'>) {
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
