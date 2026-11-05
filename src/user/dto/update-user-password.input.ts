import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class UpdateUserPasswordInput {
  @IsString()
  @MinLength(8)
  @Field(() => String, { nullable: false })
  password: string;
}
