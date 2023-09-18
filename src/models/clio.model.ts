import { Document, Schema, model } from 'mongoose';

import { Clio } from '@/interfaces/clio.interface';

const clioSchema: Schema = new Schema({
  token: {
    type: String,
  },
  message: {
    type: [
      {
        role: String,
        message: String,
      },
    ],
  },
});

const clioModel = model<Clio & Document>('Clio', clioSchema);

export default clioModel;
