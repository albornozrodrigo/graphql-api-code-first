/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GraphQLResolveInfo } from 'graphql';
import { In, Repository } from 'typeorm';
import { buildPagination, getAttributes } from '../app.utils';
import { PaginationInput } from '../common/dto/pagination.input';
import { CreateProfileInput } from './dto/create-profile.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { Profile, profileDataMap } from './entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async create(
    userId: number,
    createProfileInput: CreateProfileInput,
  ): Promise<Profile> {
    const hasProfile = await this.profileRepository.count({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (hasProfile > 0) {
      throw new Error('Profile already exists');
    }

    const newProfile = this.profileRepository.create({
      ...createProfileInput,
      user: { id: userId } as any,
    });

    return await this.profileRepository.save(newProfile);
  }

  async findAll(
    info: GraphQLResolveInfo,
    pagination?: PaginationInput,
  ): Promise<Profile[]> {
    const attributes = getAttributes(info, profileDataMap);
    const paginationData = buildPagination(pagination);

    return await this.profileRepository.find({
      ...paginationData,
      select: attributes,
      relations: {
        user: true,
      },
    });
  }

  async findAllByIds(
    ids: number[],
    info: GraphQLResolveInfo,
  ): Promise<Profile[]> {
    const attributes = getAttributes(info, profileDataMap);

    return await this.profileRepository.find({
      select: attributes,
      where: {
        id: In(ids),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllByUserIds(
    userIds: number[],
    info: GraphQLResolveInfo,
  ): Promise<Profile[]> {
    const attributes = getAttributes(info, profileDataMap);

    return await this.profileRepository
      .createQueryBuilder('profile')
      .select(Object.keys(attributes).map((attr: string) => `profile.${attr}`))
      .innerJoin('profile.user', 'user', 'user.id IN (:...userIds)', {
        userIds,
      })
      .addSelect('user.id')
      .getMany();
  }

  async findOne(id: number, info: GraphQLResolveInfo) {
    const attributes = getAttributes(info, profileDataMap);
    const profile = await this.profileRepository.findOne({
      where: {
        id,
      },
      select: attributes,
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }

  async findOneByUserId(
    userId: number,
    info: GraphQLResolveInfo,
  ): Promise<Profile> {
    const attributes = getAttributes(info, profileDataMap);

    const profile = await this.profileRepository.findOne({
      select: attributes,
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }

  async update(
    profileId: number,
    userId: number,
    updateProfileInput: UpdateProfileInput,
  ) {
    const profile = await this.profileRepository.findOne({
      where: {
        id: profileId,
      },
      relations: {
        user: true,
      },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    if ((await profile.user).id !== userId) {
      throw new Error('You are not authorized to update this profile');
    }

    Object.assign(profile, updateProfileInput);

    const res = await this.profileRepository.save(profile);

    return res;
  }

  async remove(userId: number) {
    const profile = await this.profileRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    if ((await profile.user).id !== userId) {
      throw new Error('You are not authorized to delete this profile');
    }

    const res = await this.profileRepository.delete(profile.id);

    return res.affected === 1;
  }
}
