import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { GraphQLResolveInfo } from 'graphql';
import { In, Repository } from 'typeorm';
import { buildPagination, getAttributes } from '../app.utils';
import { PaginationInput } from '../common/dto/pagination.input';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserPasswordInput } from './dto/update-user-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User, userDataMap } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async handleHashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async create(createUserInput: CreateUserInput) {
    const hasUser = await this.userRepository.count({
      where: {
        email: createUserInput.email,
      },
    });

    if (hasUser > 0) {
      throw new Error('User already exists');
    }

    createUserInput.password = await this.handleHashPassword(
      createUserInput.password,
    );

    return this.userRepository.create(createUserInput);
  }

  async findAll(
    info: GraphQLResolveInfo,
    pagination?: PaginationInput,
  ): Promise<User[]> {
    const attributes = getAttributes(info, {
      ...userDataMap,
    });

    const paginationData = buildPagination(pagination);

    return await this.userRepository.find({
      ...paginationData,
      select: attributes,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllByIds(ids: number[], info: GraphQLResolveInfo): Promise<User[]> {
    const attributes = getAttributes(info, userDataMap);

    return await this.userRepository.find({
      select: attributes,
      where: {
        id: In(ids),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllByPostIds(
    postIds: number[],
    info: GraphQLResolveInfo,
  ): Promise<User[]> {
    const attributes = getAttributes(info, userDataMap);

    return await this.userRepository
      .createQueryBuilder('user')
      .select(Object.keys(attributes).map((attr: string) => `user.${attr}`))
      .innerJoin('user.posts', 'post', 'post.id IN (:...postIds)', {
        postIds,
      })
      .addSelect('post.id')
      .getMany();
  }

  async findOne(id: number, info: GraphQLResolveInfo) {
    const attributes = getAttributes(info, userDataMap);

    const user = await this.userRepository.findOne({
      where: { id },
      select: attributes,
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async findOneById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        profile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: {
        profile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async update(id: number, updateUserInput: UpdateUserInput) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateUserInput);

    return await this.userRepository.save(user);
  }

  async updatePassword(
    id: number,
    updateUserPasswordInput: UpdateUserPasswordInput,
  ) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.password = await this.handleHashPassword(
      updateUserPasswordInput.password,
    );

    Object.assign(user, updateUserPasswordInput);

    await this.userRepository.save(user);

    return true;
  }

  async remove(id: number) {
    const res = await this.userRepository.delete(id);
    return res.affected === 1;
  }
}
