import { IsNotEmpty } from 'class-validator';

export class NewStoreDTO {
  id: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  slogan: string;
}
