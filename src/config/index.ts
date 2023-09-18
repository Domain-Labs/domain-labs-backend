import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  SOLANA_RPC_URL,
  BINANCE_RPC_URL,
  ALCHEMY_KEY,
  BNB_BASE_REGISTER_ADDR,
  BNB_REGISTER_ADDR,
  ENS_BASE_REGISTER_ADDR,
  ENS_REGISTER_ADDR,
  WALLET_KEY,
  SOLANA_KEY,
  DB_DATABASE,
  DB_HOST,
  DB_PORT,
} = process.env;
