import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserPasswordInput {
  @Field(() => String, { nullable: false })
  password: string;
}
