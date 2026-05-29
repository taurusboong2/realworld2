import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateArticleDetailsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagList?: string[];
}

export class CreateArticleDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateArticleDetailsDto)
  article: CreateArticleDetailsDto;
}
