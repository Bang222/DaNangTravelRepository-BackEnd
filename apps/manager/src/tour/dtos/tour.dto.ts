import { IsEmail, IsNotEmpty } from 'class-validator';

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
  @IsNotEmpty()
  endingAddress: string;
  @IsNotEmpty()
  startAddress: string;
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
  endingAddress?: string;
  startAddress?: string;
}
export class CartDto {
  @IsNotEmpty()
  tourId: string;
}
export class BookingTourDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  fullName: string;
  infantPassengers?: number;
  toddlerPassengers?: number;
  childPassengers?: number;
  @IsNotEmpty()
  adultPassengers: number;
  @IsNotEmpty()
  address: string;
  @IsNotEmpty()
  phone: string;
}
export class TourCommentDto {
  @IsNotEmpty()
  tourId: string;
  @IsNotEmpty()
  content: string;
}
export class ExperienceCommentDto {
  @IsNotEmpty()
  experienceId: string;
  @IsNotEmpty()
  content: string;
}
export class CreateExperienceDto {
  @IsNotEmpty()
  content: string;
  anonymous?: boolean;
}
