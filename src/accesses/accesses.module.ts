import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessesController } from './accesses.controller';
import { AccessesService } from './accesses.service';
import { Access, AccessSchema } from './schemas/access.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Access.name, schema: AccessSchema }])],
  controllers: [AccessesController],
  providers: [AccessesService],
  exports: [AccessesService],
})
export class AccessesModule {}
