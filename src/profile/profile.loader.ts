import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';

@Injectable({ scope: Scope.REQUEST })
export class ProfileLoader {
  private info: GraphQLResolveInfo;
  constructor(private readonly profileService: ProfileService) {}

  setInfo(info: GraphQLResolveInfo) {
    this.info = info;
    return this;
  }

  readonly findProfilesByUserIds = new DataLoader<number, Profile>(
    async (userIds: readonly number[]) => {
      // Buscar todos os posts de uma vez
      const profiles = await this.profileService.findAllByUserIds(
        [...userIds],
        this.info,
      );

      // Criar um mapa agrupando perfis por userId
      const profileMap = new Map<number, Profile>();
      await Promise.all(
        profiles.map(async (profile) => {
          profileMap.set((await profile.user).id, profile);
        }),
      );

      // Retornar na mesma ordem e lançar erro se não encontrar
      return userIds.map((id) => {
        const profile = profileMap.get(id);

        if (!profile) {
          throw new Error(`Profile with user id ${id} not found`);
        }

        return profile;
      });
    },
  );
}
