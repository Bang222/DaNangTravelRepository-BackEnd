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
export class UpdateTouristDTO {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  imageUrl?: string;
  lastRegisterDate?: Date;
  address?: string;
  startDate?: Date;
  endDate?: Date;
}
export class CartDto {
  @IsNotEmpty()
  tourId: string;
  @IsNotEmpty()
  quantity: number;
}
