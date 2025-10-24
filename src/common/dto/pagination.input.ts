import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsPositive } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsPositive()
  limit?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsPositive()
  page?: number;
}
