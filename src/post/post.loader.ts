/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';

@Injectable({ scope: Scope.REQUEST })
export class PostLoader {
  private info: GraphQLResolveInfo;
  constructor(private readonly postService: PostService) {}

  setInfo(info: GraphQLResolveInfo) {
    this.info = info;
    return this;
  }

  readonly findPostsByPostId = new DataLoader<number, Post>(
    async (postIds: readonly number[]) => {
      const posts = await this.postService.findAllByIds(
        [...postIds],
        this.info,
      );

      const postsMap = new Map<number, Post>();
      posts.forEach((post) => {
        postsMap.set(post.id, post);
      });

      // Retornar na mesma ordem e lançar erro se não encontrar
      return postIds.map((id) => {
        const post = postsMap.get(id);
        if (!post) {
          throw new Error(`Post with id ${id} not found`);
        }
        return post;
      });
    },
  );

  readonly findPostsByUserIds = new DataLoader<number, Post[]>(
    async (userIds: readonly number[]) => {
      // Buscar todos os posts de uma vez
      const posts = await this.postService.findAllByUserIds(
        [...userIds],
        this.info,
      );

      // Criar um mapa agrupando posts por authorId
      const postsMap = new Map<number, Post[]>();

      // Inicializar com arrays vazios para cada userId
      userIds.forEach((id) => postsMap.set(id, []));

      // Agrupar posts por authorId
      posts.forEach(async (post) => {
        const list = postsMap.get((await post.user).id);
        if (list) {
          list.push(post);
        }
      });

      // Retornar na mesma ordem dos userIds
      return userIds.map((id) => postsMap.get(id) || []);
    },
  );

  readonly findPostsByTagIds = new DataLoader<number, Post[]>(
    async (tagIds: readonly number[]) => {
      // Buscar todos os posts de uma vez
      const posts = await this.postService.findAllByTagIds(
        [...tagIds],
        this.info,
      );

      // Criar um mapa agrupando posts por authorId
      const postsMap = new Map<number, Post[]>();

      // Inicializar com arrays vazios para cada userId
      tagIds.forEach((id) => postsMap.set(id, []));

      // Agrupar posts por authorId
      posts.forEach(async (post) => {
        const list = postsMap.get((await post.user).id);
        if (list) {
          list.push(post);
        }
      });

      // Retornar na mesma ordem dos userIds
      return tagIds.map((id) => postsMap.get(id) || []);
    },
  );
}
