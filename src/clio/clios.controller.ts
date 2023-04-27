import { Body, Controller, Get, Param, Post, } from '@nestjs/common';
import { CliosService } from './clios.service';
import { Clio, } from './schemas/clio.schema';
import { CreateClioDto } from './dto/create-clio.dto';
import { RequestClioDto } from './dto/request-clio.dto';

@Controller('clios')
export class CliosController {
  constructor(private readonly cliosService: CliosService) { }

  @Post('/free-signup/')
  async freeSignup(@Body() createClioDto: CreateClioDto) {
    let isAlreadySignedUp = await this.cliosService.isAlreadySignedUp(createClioDto.wallet);
    if (isAlreadySignedUp) {
      return {
        isSuccess: false,
        result: 'You already signed up',
      };
    } else {
      let _createClioDto = {
        ...createClioDto,
        freeCount: 3,
        clioEndTimestamp: Math.round(Date.now() / 1000),
      };

      return {
        isSuccess: true,
        result: await this.cliosService.create(_createClioDto)
      };
    }
  }

  @Post('/request-clio/')
  async requestClio(@Body() requestClioDto: RequestClioDto) {
    return await this.cliosService.request(requestClioDto);
  }

  @Get('/find-all')
  async findAll(): Promise<Clio[]> {
    return await this.cliosService.findAll();
  }

  @Get('/is-signedup/:wallet')
  async isAlreadySignedUp(@Param('wallet') wallet: string): Promise<boolean> {
    return await this.cliosService.isAlreadySignedUp(wallet);
  }

  // @Get('/get-sold-counts/:timePeriod')
  // async getCountsPerPeriod(@Param('timePeriod') timePeriod: ClioGraphTimePeriod): Promise<any> {    
  //   return await this.cliosService.getCountsPerPeriod(timePeriod);
  // }

  // @Get('/get-revenue/:timePeriod')
  // async getRevenuePerPeriod(@Param('timePeriod') timePeriod: ClioGraphTimePeriod): Promise<any> {    
  //   return await this.cliosService.getRevenuePerPeriod(timePeriod);
  // }
}
