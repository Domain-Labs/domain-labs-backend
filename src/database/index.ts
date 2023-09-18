import { DB_DATABASE, DB_HOST, DB_PORT } from '@config';

export const dbConnection = {
  url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
  options: {
    autoIndex: true,
    autoCreate: true,
  },
};
