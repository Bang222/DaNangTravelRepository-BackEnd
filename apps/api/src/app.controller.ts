import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { AppService } from "./app.service";
import { ClientProxy } from "@nestjs/microservices";
import { ExistingUserDTO, NewUserDTO } from "../../auth/src/dto";
import { AuthGuard, UserRequest } from '@app/shared';
import { UserInterceptor } from "@app/shared/interceptors/user.interceptor";
import { Roles } from "../../auth/src/decorator/roles.decorator";
import { RolesGuard } from "@app/shared/guard/roles.guard";
import { Role } from "@app/shared/models/enum";
import { UseRoleGuard } from "../../auth/src/guard/role.guard";
// import { Roles } from "../../auth/src/decorator/roles.decorator";
// import { Role } from "@app/shared/models/enum";
// import { RolesGuard } from "@app/shared/guard";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy,
  ) {}

  @Get()
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(UserInterceptor)
  async getUser(@Req() req: UserRequest) {
    console.log(req.user);
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }
  @UseGuards(AuthGuard)
  @Get('presence')
  async getPresence() {
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  }
  @Post('auth')
  async postUser() {
    return this.authService.send({ cmd: 'post-user' }, {});
  }
  @Post('auth/register')
  @UsePipes(new ValidationPipe())
  async register(@Body() newUser: NewUserDTO) {
    const { firstName, lastName, email, password } = newUser;
    return this.authService.send(
      { cmd: 'register' },
      {
        firstName,
        lastName,
        email,
        password,
      },
    );
  }
  @Post('auth/login')
  async login(@Body() existingUserDTO: ExistingUserDTO) {
    const { email, password } = existingUserDTO;
    return this.authService.send({ cmd: 'login' }, { email, password });
  }
}
