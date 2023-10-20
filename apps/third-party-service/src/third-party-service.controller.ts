import { Controller, Inject } from '@nestjs/common';
import { SharedService } from '@app/shared';
import { SendMailService } from './send-mail/send-mail.service';

@Controller()
export class ThirdPartyServiceController {
  constructor(
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
    private readonly sendMailService: SendMailService,
  ) {}
}
