import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Role } from '../../enums/role.enum';

@InputType()
export class CreateUserInput {
  @IsString()
  @Field(() => String)
  name: string;

  @IsString()
  @IsEmail()
  @Field(() => String)
  email: string;

  @IsString()
  @Field(() => String)
  password: string;

  @IsString()
  @IsOptional()
  @Field(() => Role, { nullable: true })
  role?: Role;
}
