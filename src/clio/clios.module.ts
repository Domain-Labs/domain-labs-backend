import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClioGateway } from './clios.gateway';
import { CliosController } from './clios.controller';
import { CliosService } from './clios.service';
import { Clio, ClioSchema } from './schemas/clio.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Clio.name, schema: ClioSchema }])],
  controllers: [CliosController],
  providers: [CliosService, ClioGateway],
  exports: [CliosService],
})
export class CliosModule {}
