import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

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
