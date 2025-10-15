import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';

@InputType()
export class CreateUserInput {
  @IsString()
  @Field(() => String)
  name: string;

  @IsString()
  @IsEmail()
  @Field(() => String)
  email: string;
}
