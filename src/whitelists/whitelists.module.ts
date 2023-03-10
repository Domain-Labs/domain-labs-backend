import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WhitelistsController } from './whitelists.controller';
import { WhitelistsService } from './whitelists.service';
import { Whitelist, WhitelistSchema } from './schemas/whitelist.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Whitelist.name, schema: WhitelistSchema }])],
  controllers: [WhitelistsController],
  providers: [WhitelistsService],
  exports: [WhitelistsService],
})
export class WhitelistsModule {}
