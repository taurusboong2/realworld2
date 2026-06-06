import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class UpdateArticleDetailsDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(120)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(300)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(20000)
  body?: string;
}

export class UpdateArticleDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => UpdateArticleDetailsDto)
  article: UpdateArticleDetailsDto;
}
