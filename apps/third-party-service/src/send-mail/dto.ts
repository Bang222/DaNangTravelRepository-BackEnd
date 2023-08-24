export interface configDataSendMail {
  email: string;
  data: {
    id: string;
    tourName: string;
    TotalPrice: number;
    participants: number;
    startDay: Date;
    endDate: Date;
  };
}
