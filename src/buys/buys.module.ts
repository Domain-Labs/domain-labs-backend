import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuysController } from './buys.controller';
import { BuysService } from './buys.service';
import { Buy, BuySchema } from './schemas/buy.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Buy.name, schema: BuySchema }])],
  controllers: [BuysController],
  providers: [BuysService],
  exports: [BuysService],
})
export class BuysModule {}
