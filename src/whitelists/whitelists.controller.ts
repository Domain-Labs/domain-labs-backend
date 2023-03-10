import { Controller, Get, Param, Post, Body, } from '@nestjs/common';
import { BuyGraphTimePeriod } from 'src/buys/schemas/buy.schema';
import { WhitelistsService } from './whitelists.service';
import { Whitelist } from './schemas/whitelist.schema';
import { CreateWhitelistDto } from './dto/create-whitelist.dto';

@Controller('whitelists')
export class WhitelistsController {
  constructor(private readonly whitelistsService: WhitelistsService) { }

  @Post('/write-log/')
  async writeLog(@Body() createWhitelistDto: CreateWhitelistDto) {
    let _createWhitelistDto = {
      ...createWhitelistDto,
      whitelistCount: 1,
      whitelistTime: new Date(),
      whitelistYear: new Date().getFullYear().toString(),
      whitelistMonth: new Date().getMonth() < 9 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1).toString(),
      whitelistDate: new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate().toString(),
      whitelistHour: new Date().getHours() < 10 ? "0" + new Date().getHours() : new Date().getHours().toString(),
      whitelistMinute: new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes().toString(),
    };

    console.log("whitelist: ", _createWhitelistDto);
    return await this.whitelistsService.create(_createWhitelistDto);
  }

  @Get('/find-all')
  async findAll(): Promise<Whitelist[]> {
    return await this.whitelistsService.findAll();
  }

  @Get('/get-counts/:timePeriod')
  async getCountsPerPeriod(@Param('timePeriod') timePeriod: BuyGraphTimePeriod): Promise<any> {
    return await this.whitelistsService.getCountsPerPeriod(timePeriod);
  }

  @Get('/is-whitelist/:wallet')
  async isWhitelist(@Param('wallet') wallet: string): Promise<boolean> {
    return await this.whitelistsService.isWhitelist(wallet);
  }
}
