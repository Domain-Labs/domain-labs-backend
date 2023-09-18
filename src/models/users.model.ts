import { Document, Schema, model } from 'mongoose';

import { User } from '@interfaces/users.interface';

const userSchema: Schema = new Schema({
  address: {
    type: String,
    require: true,
  },
  email: {
    type: String,
  },
  chain: {
    type: String,
    require: true,
  },
  balance: {
    type: Number,
  },
  paidBalance: {
    type: Number,
  },
  completed: {
    type: Boolean,
  },
  domains: {
    type: [
      {
        name: String,
        type: String,
        status: Boolean,
      },
    ],
  },
  checkSum: {
    type: String,
  },
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
