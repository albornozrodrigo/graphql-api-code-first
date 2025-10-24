/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';
import { Tag } from './entities/tag.entity';
import { TagService } from './tag.service';

@Injectable({ scope: Scope.REQUEST })
export class TagLoader {
  private info: GraphQLResolveInfo;
  constructor(private readonly tagService: TagService) {}

  setInfo(info: GraphQLResolveInfo) {
    this.info = info;
    return this;
  }

  readonly findTagsByTagId = new DataLoader<number, Tag>(
    async (tagIds: readonly number[]) => {
      const tags = await this.tagService.findAllByIds([...tagIds], this.info);

      const tagsMap = new Map<number, Tag>();
      tags.forEach((tag) => {
        tagsMap.set(tag.id, tag);
      });

      // Retornar na mesma ordem e lançar erro se não encontrar
      return tagIds.map((id) => {
        const tag = tagsMap.get(id);
        if (!tag) {
          throw new Error(`Tag with id ${id} not found`);
        }
        return tag;
      });
    },
  );

  readonly findTagsByPostIds = new DataLoader<number, Tag[]>(
    async (postIds: readonly number[]) => {
      // Buscar todos as tags de uma vez
      const tags = await this.tagService.findAllByPostIds(
        [...postIds],
        this.info,
      );

      // Criar um mapa agrupando tags por postId
      const tagsMap = new Map<number, Tag[]>();

      // Inicializar com arrays vazios para cada postId
      postIds.forEach((id) => tagsMap.set(id, []));

      // Agrupar tags por postId
      tags.forEach(async (tag) => {
        // Para cada tag, verificar em quais posts ela está associada
        const tagPosts = await tag.posts;
        tagPosts.forEach((post) => {
          const list = tagsMap.get(post.id);
          if (list) {
            list.push(tag);
          }
        });
      });

      // Retornar na mesma ordem dos postIds
      return postIds.map((id) => tagsMap.get(id) || []);
    },
  );
}
