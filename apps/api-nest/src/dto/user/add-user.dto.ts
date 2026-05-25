import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
