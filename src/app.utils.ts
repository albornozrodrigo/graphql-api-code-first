/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { FindOptionsSelect } from 'typeorm';
import { PaginationInput } from './common/dto/pagination.input';
import { Post } from './post/entities/post.entity';
import { Profile } from './profile/entities/profile.entity';
import { Tag } from './tag/entities/tag.entity';
import { User } from './user/entities/user.entity';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const buildPagination = (pagination: PaginationInput | undefined) => {
  const limit = Math.min(pagination?.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const page = pagination?.page || 1;
  const offset = (page - 1) * limit;
  return { offset, limit };
};

export const getAttributes = (
  info: GraphQLResolveInfo,
  columnMap: Record<string, string>,
) => {
  const fields: any = graphqlFields(info);

  const attributes: FindOptionsSelect<User | Post | Profile | Tag> = {};

  for (const field in fields) {
    if (columnMap[field]) attributes[columnMap[field]] = true;
  }

  // for (const field in fields) {
  //   if (field in columnMap) {
  //     attributes[columnMap[field]] = true;
  //   } else {
  //     attributes[field] = false;
  //   }
  // }

  // O id é sempre necessário para os DataLoaders agruparem os resultados
  attributes['id'] = true;

  return attributes;
};
