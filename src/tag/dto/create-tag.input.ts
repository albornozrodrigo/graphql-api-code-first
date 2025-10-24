import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateTagInput {
  @Field(() => String, { nullable: false })
  name: string;

  @Field(() => Int, { nullable: false })
  postId: number;
}
