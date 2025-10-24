import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProfileInput {
  @Field(() => String, { nullable: false })
  bio: string;

  @Field(() => String, { nullable: false })
  avatar: string;
}
