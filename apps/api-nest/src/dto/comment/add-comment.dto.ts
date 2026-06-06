import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class AddCommentDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(2000)
  body: string;
}

export class AddCommentDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => AddCommentDetailsDto)
  comment: AddCommentDetailsDto;
}
