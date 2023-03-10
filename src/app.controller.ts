import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AccessesService } from './accesses/accesses.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly accessesService: AccessesService,
  ) { }

  @Get()
  sayHello() {
    return this.appService.getHello();
  }

}
