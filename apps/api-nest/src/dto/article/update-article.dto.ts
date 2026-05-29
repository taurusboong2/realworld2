import { Type } from 'class-transformer';
import {
  IsDefined,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateArticleDetailsDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  body?: string;
}

export class UpdateArticleDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => UpdateArticleDetailsDto)
  article: UpdateArticleDetailsDto;
}
