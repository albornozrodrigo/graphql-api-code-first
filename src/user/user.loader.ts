import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  private info: GraphQLResolveInfo;

  constructor(private readonly userService: UserService) {}

  setInfo(info: GraphQLResolveInfo) {
    this.info = info;
    return this;
  }

  readonly findUsersByUserId = new DataLoader<number, User>(
    async (userIds: readonly number[]) => {
      // Buscar todos os usuários de uma vez
      const users = await this.userService.findAllByIds(
        [...userIds],
        this.info,
      );

      // Criar um mapa agrupando usuários por id
      const userMap = new Map<number, User>();
      users.forEach((user) => {
        userMap.set(user.id, user);
      });

      // Retornar na mesma ordem e lançar erro se não encontrar
      return userIds.map((id: number) => {
        const user = userMap.get(id);

        if (!user) {
          throw new Error(`User with id ${id} not found`);
        }

        return user;
      });
    },
  );

  readonly findUsersByPostId = new DataLoader<number, User>(
    async (postIds: readonly number[]) => {
      // Buscar todos os usuários de uma vez
      const users = await this.userService.findAllByPostIds(
        [...postIds],
        this.info,
      );

      const postsMap = new Map<number, User>();

      for (const user of users) {
        const posts = await user.posts; // Só virá os posts filtrados
        for (const post of posts) {
          if (!postsMap.has(post.id)) {
            postsMap.set(post.id, user);
          }
        }
      }

      // Retornar na mesma ordem e lançar erro se não encontrar
      return postIds.map((id: number) => {
        const user = postsMap.get(id);

        if (!user) {
          throw new Error(`User with id ${id} not found`);
        }

        return user;
      });
    },
  );
}
