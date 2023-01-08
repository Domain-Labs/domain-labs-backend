import { Body, Controller, Get, Param, Post, } from '@nestjs/common';
import { BuysService } from './buys.service';
import { Buy, BuyGraphTimePeriod } from './schemas/buy.schema';
import { CreateBuyDto } from './dto/create-buy.dto';

@Controller('buys')
export class BuysController {
  constructor(private readonly buysService: BuysService) { }

  @Post('/write-log/')
  async writeLog(@Body() createBuyDto: CreateBuyDto) {
    console.log("input: ", createBuyDto);
    console.log("buy year: ", new Date().getFullYear().toString())

    let _createBuyDto = {
      ...createBuyDto,
      buyTime: new Date(),
      buyYear: new Date().getFullYear().toString(),
      buyMonth: new Date().getMonth() < 9 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1).toString(),
      buyDate: new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate().toString(),
      buyHour: new Date().getHours() < 10 ? "0" + new Date().getHours() : new Date().getHours().toString(),
      buyMinute: new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes().toString(),
    };

    return await this.buysService.create(_createBuyDto);
  }

  @Get('/find-all')
  async findAll(): Promise<Buy[]> {
    return await this.buysService.findAll();
  }

  @Get('/get-sold-counts/:timePeriod')
  async getCountsPerPeriod(@Param('timePeriod') timePeriod: BuyGraphTimePeriod): Promise<any> {    
    return await this.buysService.getCountsPerPeriod(timePeriod);
  }

  @Get('/get-revenue/:timePeriod')
  async getRevenuePerPeriod(@Param('timePeriod') timePeriod: BuyGraphTimePeriod): Promise<any> {    
    return await this.buysService.getRevenuePerPeriod(timePeriod);
  }
}
