import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    const newUser = this.userRepository.create(createUserInput);
    return await this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    return await this.userRepository.findOneByOrFail({ id });
  }

  async update(id: number, updateUserInput: UpdateUserInput) {
    await this.userRepository.update(id, updateUserInput);
    return await this.userRepository.findOneByOrFail({ id });
  }

  async remove(id: number) {
    const res = await this.userRepository.delete(id);
    return res.affected === 1;
  }
}
