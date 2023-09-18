import { Document, Schema, model } from 'mongoose';

import { Purchase } from '@/interfaces/domain.interface';

const purchaseSchema: Schema = new Schema({
  domains: {
    type: Array<{
      name: String;
      type: String;
      duration?: Number;
    }>,
  },
  address: {
    type: String,
  },
  solAddress: {
    type: String,
  },
  estimationAmount: {
    type: Number,
  },
  amountReceived: {
    type: Number,
  },
  transaction: {
    type: String,
  },
  purchased: {
    type: Boolean,
  },
  failed: {
    type: Array<{
      name: String;
      type: String;
      duration?: Number;
    }>,
  },
  paymentOption: {
    type: String,
  },
  created: {
    type: Date,
  },
});

const purchaseModel = model<Purchase & Document>('Purchase', purchaseSchema);

export default purchaseModel;
