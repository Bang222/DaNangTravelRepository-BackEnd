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
export interface dataSendMailBefore3days {
  tourId: string;
  tourName: string;
  email: string;
  particular: number;
  startDay: Date;
  endDate: Date;
}
