import { IsEmail, IsNotEmpty } from 'class-validator';
export class NewUserDTO {
  firstName: string;
  lastName: string;
  @IsEmail()
  email: string;

  sex: string;

  @IsNotEmpty()
  password: string;
}
