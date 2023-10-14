import { IsNotEmpty } from 'class-validator';

export class NewStoreDTO {
  id: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  slogan: string;
  @IsNotEmpty()
  paymentId: string;
}
export class DataEachMonthDashBoardDTO {
  totalIncome: number;
  month: number;
}
