import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClioDocument = HydratedDocument<Clio>;

@Schema({ timestamps: true, optimisticConcurrency: true })
export class Clio {
  @Prop({ required: true, maxLength: 42 })
  wallet: string;

  @Prop({ required: true })
  freeCount: number;

  @Prop({ required: true })
  clioEndTimestamp: number;
}

export const ClioSchema = SchemaFactory.createForClass(Clio);
