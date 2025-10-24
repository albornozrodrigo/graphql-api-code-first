/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GraphQLResolveInfo } from 'graphql';
import { In, Repository } from 'typeorm';
import { buildPagination, getAttributes } from '../app.utils';
import { PaginationInput } from '../common/dto/pagination.input';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post, postDataMap } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async create(userId: number, createPostInput: CreatePostInput) {
    const hasPost = await this.postRepository.count({
      where: {
        title: createPostInput.title,
      },
    });

    if (hasPost > 0) {
      throw new Error('Title already used');
    }

    const newPost = this.postRepository.create({
      ...createPostInput,
      user: {
        id: userId,
      } as any,
      tags: createPostInput.tagIds?.map((id) => ({ id }) as any) ?? [],
    });

    return await this.postRepository.save(newPost);
  }

  async findAll(
    info: GraphQLResolveInfo,
    pagination?: PaginationInput,
  ): Promise<Post[]> {
    const attributes = getAttributes(info, postDataMap);
    const paginationData = buildPagination(pagination);

    return await this.postRepository.find({
      ...paginationData,
      select: attributes,
    });
  }

  async findAllByUserId(
    userId: number,
    info: GraphQLResolveInfo,
    pagination?: PaginationInput,
  ): Promise<Post[]> {
    const attributes = getAttributes(info, postDataMap);
    const paginationData = buildPagination(pagination);

    return await this.postRepository.find({
      ...paginationData,
      select: attributes,
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
        tags: true,
      },
    });
  }

  async findAllByIds(ids: number[], info: GraphQLResolveInfo): Promise<Post[]> {
    const attributes = getAttributes(info, postDataMap);

    return await this.postRepository.find({
      select: attributes,
      where: {
        id: In(ids),
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        user: true,
        tags: true,
      },
    });
  }

  async findAllByUserIds(userIds: number[], info: GraphQLResolveInfo) {
    const attributes = getAttributes(info, postDataMap);

    const attrs = Object.entries(attributes || {})
      .filter(([key]) => typeof key === 'string' && !!key)
      .map(([key]) => key);

    return await this.postRepository
      .createQueryBuilder('post')
      .select(attrs.map((attr: string) => `post.${attr}`))
      .innerJoin('post.user', 'user', 'user.id IN (:...userIds)', {
        userIds,
      })
      .addSelect('user.id')
      .getMany();
  }

  async findAllByTagIds(tagIds: number[], info: GraphQLResolveInfo) {
    const attributes = getAttributes(info, postDataMap);

    const attrs = Object.entries(attributes || {})
      .filter(([key]) => typeof key === 'string' && !!key)
      .map(([key]) => key);

    return await this.postRepository
      .createQueryBuilder('post')
      .select(attrs.map((attr: string) => `post.${attr}`))
      .innerJoin('post.tags', 'tag', 'tag.id IN (:...tagIds)', {
        tagIds,
      })
      .addSelect('tag.id')
      .getMany();
  }

  async findOne(id: number, info: GraphQLResolveInfo) {
    const attributes = getAttributes(info, postDataMap);
    const post = await this.postRepository.findOne({
      where: {
        id,
      },
      select: attributes,
      relations: {
        user: true,
        tags: true,
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  }

  async update(
    postId: number,
    userId: number,
    updatePostInput: UpdatePostInput,
  ) {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
      relations: {
        user: true,
        tags: true,
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if ((await post.user).id !== userId) {
      throw new Error('You are not authorized to update this post');
    }

    Object.assign(post, updatePostInput);

    if (updatePostInput.tagIds) {
      post.tags = updatePostInput.tagIds.map((id) => ({ id }) as any);
    }

    const updatedPost = await this.postRepository.save(post);

    return updatedPost;
  }

  async remove(postId: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if ((await post.user).id !== userId) {
      throw new Error('You are not authorized to delete this post');
    }

    const res = await this.postRepository.delete(postId);

    return res.affected === 1;
  }
}
