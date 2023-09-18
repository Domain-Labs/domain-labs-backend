import { Document, Schema, model } from 'mongoose';

import { Domain } from '@/interfaces/domain.interface';

const domainSchema: Schema = new Schema({
  label: {
    type: String,
  },
  type: {
    type: String,
  },
  address: {
    type: String,
  },
  solAddress: {
    type: String,
  },
  committed: {
    type: Boolean,
  },
  commitSecret: {
    type: String,
  },
  duration: {
    type: Number,
  },
  created: {
    type: Date,
  },
});

const domainModel = model<Domain & Document>('Domain', domainSchema);

export default domainModel;
