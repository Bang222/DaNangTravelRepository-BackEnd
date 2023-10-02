import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PassengerEntity } from '@app/shared';

export class TourDTO {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  price: number;
  @IsNotEmpty()
  quantity: number;
  imageUrl?: string[];
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
export class NewTouristDTO {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  price: number;
  quantity: number;
  @IsNotEmpty()
  baseQuantity: number;
  imageUrl?: string[];
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
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedules: ScheduleDto[];
}
export class UpdateTouristDTO {
  name?: string;
  description?: string;
  baseQuantity?: number;
  lastRegisterDate?: Date;
  @Type(() => ScheduleDto)
  schedules?: ScheduleDto[];
}
export class CartDto {
  @IsNotEmpty()
  tourId: string;
}
export class PassengerDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  type: string;
  @IsNotEmpty()
  sex: string;
  dayOfBirth?: Date;
}
export class BookingTourDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  fullName: string;
  @IsNotEmpty()
  adultPassengers: number;
  childPassengers?: number;
  toddlerPassengers?: number;
  infantPassengers?: number;
  @IsNotEmpty()
  address: string;
  @IsNotEmpty()
  phone: string;
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passenger: [
    {
      name: string;
      type: string;
      sex: string;
      dayOfBirth?: number;
    },
  ];
}

export class ScheduleDto {
  @IsNotEmpty()
  day: number;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  // @IsNotEmpty()
  imgUrl?: string;
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
  @IsNotEmpty()
  title: string;
  imgUrl: string;

  anonymous?: boolean;
}
