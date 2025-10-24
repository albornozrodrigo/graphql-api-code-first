import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GraphQLResolveInfo } from 'graphql';
import { In, Repository } from 'typeorm';
import { buildPagination, getAttributes } from '../app.utils';
import { PaginationInput } from '../common/dto/pagination.input';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { Tag, tagDataMap } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagInput: CreateTagInput): Promise<Tag> {
    const hasTag = await this.tagRepository.count({
      where: {
        name: createTagInput.name,
      },
    });

    if (hasTag > 0) {
      throw new Error('Tag already used');
    }

    const newTag = this.tagRepository.create(createTagInput);

    return await this.tagRepository.save(newTag);
  }

  async findAll(
    info: GraphQLResolveInfo,
    pagination?: PaginationInput,
  ): Promise<Tag[]> {
    const attributes = getAttributes(info, tagDataMap);
    const paginationData = buildPagination(pagination);

    return await this.tagRepository.find({
      ...paginationData,
      select: attributes,
    });
  }

  async findAllByPostId(
    postId: number,
    info: GraphQLResolveInfo,
    pagination?: PaginationInput,
  ): Promise<Tag[]> {
    const attributes = getAttributes(info, tagDataMap);
    const paginationData = buildPagination(pagination);

    return await this.tagRepository.find({
      ...paginationData,
      select: attributes,
      where: {
        posts: {
          id: postId,
        },
      },
      relations: {
        posts: true,
      },
    });
  }

  async findAllByPostIds(
    postIds: number[],
    info: GraphQLResolveInfo,
  ): Promise<Tag[]> {
    const attributes = getAttributes(info, tagDataMap);

    // return await this.tagRepository.find({
    //   select: attributes,
    //   where: {
    //     posts: {
    //       id: In(postIds),
    //     },
    //   },
    //   relations: {
    //     posts: true,
    //   },
    // });

    return await this.tagRepository
      .createQueryBuilder('tag')
      .select(Object.keys(attributes).map((attr: string) => `user.${attr}`))
      .innerJoin('tag.posts', 'post', 'post.id IN (:...postIds)', {
        postIds,
      })
      .addSelect('tag.id')
      .getMany();
  }

  async findAllByIds(ids: number[], info: GraphQLResolveInfo): Promise<Tag[]> {
    const attributes = getAttributes(info, tagDataMap);

    return await this.tagRepository.find({
      select: attributes,
      where: {
        id: In(ids),
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        posts: true,
      },
    });
  }

  async findOne(id: number, info: GraphQLResolveInfo) {
    const attributes = getAttributes(info, tagDataMap);

    const tag = await this.tagRepository.findOne({
      select: attributes,
      where: {
        id,
      },
      relations: {
        posts: true,
      },
    });

    if (!tag) {
      throw new Error('Tag not found');
    }

    return tag;
  }

  async update(id: number, updateTagInput: UpdateTagInput) {
    const tag = await this.tagRepository.findOne({
      where: {
        id,
      },
      relations: {
        posts: true,
      },
    });

    if (!tag) {
      throw new Error('Tag not found');
    }

    Object.assign(tag, updateTagInput);

    const res = await this.tagRepository.save(tag);

    return res;
  }

  async remove(id: number) {
    const tag = await this.tagRepository.findOne({
      where: {
        id,
      },
    });

    if (!tag) {
      throw new Error('Tag no found');
    }

    const res = await this.tagRepository.delete(id);

    return res.affected === 1;
  }
}
