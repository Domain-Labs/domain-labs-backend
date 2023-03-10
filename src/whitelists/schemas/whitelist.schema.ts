
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WhitelistDocument = HydratedDocument<Whitelist>;

@Schema({/* timestamps: true,*/ optimisticConcurrency: true, })
export class Whitelist {
  @Prop({ required: true, })
  wallet: string;

  @Prop({ required: true, })
  country: string;

  @Prop({ required: true, })
  whitelistCount: number;

  @Prop({ required: true })
  whitelistTime: Date;

  @Prop({ required: true })
  whitelistYear?: string;

  @Prop({ required: true })
  whitelistMonth?: string;

  @Prop({ required: true })
  whitelistDate?: string;

  @Prop({ required: true })
  whitelistHour?: string;

  @Prop({ required: true })
  whitelistMinute?: string;
}

export const WhitelistSchema = SchemaFactory.createForClass(Whitelist);
