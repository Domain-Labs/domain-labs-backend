import { Controller, Get, Param, } from '@nestjs/common';
import { BuyGraphTimePeriod } from 'src/buys/schemas/buy.schema';
import { AccessesService } from './accesses.service';
import { Access } from './schemas/access.schema';

@Controller('accesses')
export class AccessesController {
  constructor(private readonly accessesService: AccessesService) { }

  @Get('/write-log/:wallet')
  async writeLog(@Param('wallet') wallet: string) {
    const createAccessDto = {
      wallet: wallet,
      accessCount: 1,
      accessTime: new Date(),
      accessYear: new Date().getFullYear().toString(),
      accessMonth: new Date().getMonth() < 9 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1).toString(),
      accessDate: new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate().toString(),
      accessHour: new Date().getHours() < 10 ? "0" + new Date().getHours() : new Date().getHours().toString(),
      accessMinute: new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes().toString(),
    };

    return await this.accessesService.create(createAccessDto);
  }

  @Get('/find-all')
  async findAll(): Promise<Access[]> {
    return await this.accessesService.findAll();
  }

  @Get('/get-counts/:timePeriod')
  async getCountsPerPeriod(@Param('timePeriod') timePeriod: BuyGraphTimePeriod): Promise<any> {
    return await this.accessesService.getCountsPerPeriod(timePeriod);

  }
}
