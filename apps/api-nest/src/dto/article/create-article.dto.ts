import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

const normalizeTagList = (value: unknown): unknown => {
  if (!Array.isArray(value)) {
    return value;
  }

  return value
    .map((tag) => (typeof tag === 'string' ? tag.trim() : tag))
    .filter((tag, index, tags) => tag !== '' && tags.indexOf(tag) === index);
};

export class CreateArticleDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(300)
  description: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(20000)
  body: string;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => normalizeTagList(value))
  tagList?: string[];
}

export class CreateArticleDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateArticleDetailsDto)
  article: CreateArticleDetailsDto;
}
