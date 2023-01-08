import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessesModule } from './accesses/accesses.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BuysModule } from './buys/buys.module';
require('dotenv').config();

@Module({
  imports: [
    // MongooseModule.forRoot(process.env.MONGODB_LOCALHOST_URL), //  for localhost
    MongooseModule.forRoot(process.env.MONGODB_CLOUD_URL), // for cloud
    AccessesModule,
    BuysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
