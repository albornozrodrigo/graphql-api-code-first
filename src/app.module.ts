import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Post } from './post/entities/post.entity';
import { PostModule } from './post/post.module';
import { Profile } from './profile/entities/profile.entity';
import { ProfileModule } from './profile/profile.module';
import { Tag } from './tag/entities/tag.entity';
import { TagModule } from './tag/tag.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      debug: true,
      autoSchemaFile: 'src/schema.gql',
      installSubscriptionHandlers: true,
      // formatError: (error) => {
      //   return {
      //     message: error.message,
      //     code: error.extensions?.code,
      //   };
      // },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: 5432,
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Profile, Post, Tag],
      synchronize: true,
      autoLoadEntities: true,
      logging: ['query', 'error'],
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    AuthModule,
    UserModule,
    PostModule,
    ProfileModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
