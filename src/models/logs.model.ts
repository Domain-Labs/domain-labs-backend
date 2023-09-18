import { Document, Schema, model } from 'mongoose';

import { Log } from '@/interfaces/log.interface';

const logSchema: Schema = new Schema({
  address: {
    type: String,
  },
  solAddress: {
    type: String,
  },
  event: {
    type: String,
  },
  created: {
    type: Date,
  },
});

const logModel = model<Log & Document>('Log', logSchema);

export default logModel;
