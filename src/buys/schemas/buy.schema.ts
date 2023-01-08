import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BuyDocument = HydratedDocument<Buy>;

export enum BuyGraphTimePeriod {
  Hour,
  Day,
  Month,
}

@Schema({/* timestamps: true,*/ optimisticConcurrency: true })
export class Buy {
  @Prop({ required: true, maxLength: 42 })
  wallet: string;

  @Prop({ required: true })
  buyCount: number;

  @Prop({ required: true })
  buyMoney: number;

  @Prop({ required: true })
  buyTime?: Date;

  @Prop({ required: true })
  buyYear?: string;

  @Prop({ required: true })
  buyMonth?: string;

  @Prop({ required: true })
  buyDate?: string;

  @Prop({ required: true })
  buyHour?: string;

  @Prop({ required: true })
  buyMinute?: string;

  @Prop()
  period: BuyGraphTimePeriod;
}

export const BuySchema = SchemaFactory.createForClass(Buy);
