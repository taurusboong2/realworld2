import {
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddCommentDetailsDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class AddCommentDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => AddCommentDetailsDto)
  comment: AddCommentDetailsDto;
}
