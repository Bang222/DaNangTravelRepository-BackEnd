import { IsNotEmpty } from 'class-validator';

export class NewTouristDTO {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  price: number;
  @IsNotEmpty()
  quantity: number;
  imageUrl?: string;
  @IsNotEmpty()
  lastRegisterDate: Date;
  @IsNotEmpty()
  address: string;
  @IsNotEmpty()
  startDate: Date;
  @IsNotEmpty()
  endDate: Date;
}
export class CartDto {
  @IsNotEmpty()
  tourId: string;
  @IsNotEmpty()
  quantity: number;
}
