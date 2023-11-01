import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import { SharedServiceInterface } from '@app/shared/interfaces/service-interface/shared.service.interface';

@Injectable()
export class SharedService implements SharedServiceInterface {
  constructor(private readonly configService: ConfigService) {}
  getRmqOptions(queue: string): RmqOptions {
    const USER = this.configService.get<string>('RABBITMQ_USER');
    const PASSWORD = this.configService.get<string>('RABBITMQ_PASS');
    const HOST = this.configService.get<string>('RABBITMQ_HOST');
    return {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
        noAck: false,
        queue,
        queueOptions: {
          durable: true,
          // name: `${queue}DLX`
        },
      },
    };
  }
  acknowledgeMessage(context: RmqContext) {
    try{
      const channel = context.getChannelRef(); //allow particular me
      // Set the message TTL in milliseconds (e.g., 10000ms for 10 seconds)// ssenger
      const message = context.getMessage();
      // set error time to leave
      // message.properties.expiration = '10000';
      // channel.sendToQueue(queue, Buffer.from(JSON.stringify(message.content), { expiration: message.properties.expiration }));
      channel.ack(message);
    } catch(error){
      console.error(error)
      // đối số thứ 2 nếu bằng True thì nó sẽ đẩy ngược lên lại Queue đang đợi nếu bằng false thì sẽ đấy xuống Queue bị lỗi
      // đối số 3 thì chỉ định từ chối nhiều thư hay không nêys false thì sẽ chỉ từ chối cái thư này thôi
      context.getChannelRef().nack(context.getMessage(),true,false)
    }
  }
  // setFalseMessage(context:RmqContext){
  //   const channel = context.getChannelRef(); //allow particular messenger
  //   const message = context.getMessage();
  //   channel.ack(message);
  // }
}
