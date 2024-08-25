import { IsOptional, IsString, Length } from 'class-validator';
import { CreatePostDto } from './create-post.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @Length(1, 50)
  @IsString()
  title?: string;

  @IsOptional()
  @Length(1, 2000)
  @IsString()
  content?: string;
}