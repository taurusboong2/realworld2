import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class UpdateUserDetailsDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^[\p{L}\p{N}_-]+$/u)
  @MaxLength(30)
  @MinLength(3)
  username?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(8)
  @MaxLength(72)
  password?: string;

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @MaxLength(254)
  email?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(500)
  bio?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf((dto: UpdateUserDetailsDto) => dto.image !== '')
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  image?: string;
}

export class UpdateUserDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => UpdateUserDetailsDto)
  user: UpdateUserDetailsDto;
}
