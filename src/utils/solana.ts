import { Commitment, Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  NATIVE_MINT,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { NameRegistryState, getDomainKeySync, getReverseKeySync, registerDomainName } from '@bonfida/spl-name-service';

import { DomainStatus } from '@/interfaces/domain.interface';
import axios from 'axios';

/**
 * We want a 1kB sized domain (max 10kB)
 */
const space = 1 * 1_1000;
const referral = '8kJqxAbqbPLGLMgB6FhLcnw2SiUEavx2aEGM3WQGhtJF';

const tokenList = [
  {
    decimals: 6,
    tokenSymbol: 'USDC',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    tokenName: 'USD Coin',
    pythFeed: 'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/f3ffd0b9ae2165336279ce2f8db1981a55ce30f8/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    decimals: 9,
    tokenSymbol: 'SOL',
    mintAddress: 'So11111111111111111111111111111111111111112',
    pythFeed: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
    tokenName: 'Wrapped SOL',
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  {
    decimals: 6,
    tokenSymbol: 'FIDA',
    mintAddress: 'EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp',
    tokenName: 'Bonfida Token',
    pythFeed: 'ETp9eKXVv1dWwHSpsXRUuXHmw24PwRkttCGVgpZEY9zF',
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp/logo.svg',
  },
  {
    decimals: 6,
    tokenSymbol: 'USDT',
    mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    tokenName: 'USDT',
    pythFeed: '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/D3KdBta3p53RV5FoahnJM5tP45h6Fd3AyFYgXTJvGCaK/logo.svg',
  },
  {
    decimals: 9,
    tokenSymbol: 'mSOL',
    mintAddress: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    tokenName: 'mSOL',
    pythFeed: 'E4v1BBgoso9s64TQvmyownAVJbhbEPGyzA3qn4n46qj9',
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
  },

  {
    decimals: 5,
    tokenSymbol: 'BONK',
    mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    tokenName: 'BONK',
    pythFeed: '8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN',
    icon: 'https://solana.fm/api/image-proxy?imageUrl=https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
  },

  {
    decimals: 8,
    tokenSymbol: 'BAT',
    mintAddress: 'EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz',
    tokenName: 'BAT',
    pythFeed: 'AbMTYZ82Xfv9PtTQ5e1fJXemXjzqEEFHP3oDLRTae6yz',
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz/logo.png',
  },
];

export const checkAvailable = async (connection: Connection, name: string): Promise<DomainStatus> => {
  const domain = tokenizeDomain(name);
  const reverseKey = getReverseKeySync(domain);
  const acc = await connection.getAccountInfo(reverseKey);
  if (!!acc) {
    try {
      const { pubkey } = getDomainKeySync(domain);
      const { registry } = await NameRegistryState.retrieve(connection, pubkey);
      return {
        name: domain,
        type: 'SOL',
        owner: registry.owner.toString(),
        registered: true,
      };
    } catch (e) {
      // not registered
      console.log(e, 'account does not exist');
    }
  } else {
    return {
      name: domain,
      type: 'SOL',
      registered: false,
    };
  }
};

export const tokenizeDomain = (domain: string): string => {
  const token = String(domain).split('.');
  const len = token.length;
  if (token[len - 1] === 'sol') {
    return token[len - 2];
  } else {
    return token[len - 1];
  }
};

export const wrapSol = async (connection: Connection, ata: PublicKey, owner: PublicKey, amount: number): Promise<TransactionInstruction[]> => {
  let transferAmount = amount;
  const instructions: TransactionInstruction[] = [];

  const nativeBalances = await connection.getBalance(owner);

  const info = await connection.getAccountInfo(ata);
  if (!info || !info.data) {
    const ix = createAssociatedTokenAccountInstruction(owner, ata, owner, NATIVE_MINT);
    instructions.push(ix);
  } else {
    const balance = await connection.getTokenAccountBalance(ata, 'processed');
    if (nativeBalances + parseInt(balance.value.amount) < amount) {
      throw new Error('Not enough SOL balances');
    }
    transferAmount -= parseInt(balance.value.amount);
    if (transferAmount <= 0) {
      console.log(`Enough wrapped SOL`);
      return [];
    }
  }

  let ix = SystemProgram.transfer({
    fromPubkey: owner,
    toPubkey: ata,
    lamports: transferAmount,
  });
  instructions.push(ix);

  ix = createSyncNativeInstruction(ata);
  instructions.push(ix);

  return instructions;
};

export const unwrapSol = (ata: PublicKey, owner: PublicKey): TransactionInstruction[] => {
  const ix = createCloseAccountInstruction(ata, owner, owner);
  return [ix];
};

export const register = async (connection: Connection, domains: string[], address: PublicKey, signer: Keypair) => {
  const pricingTable = {
    5: 20, //20
    4: 160, //160
    3: 640, //640
    2: 700, //700
    1: 750, //750
  };
  const pricingInSolTable = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };
  const rlt = await axios.get(`https://binance.com/api/v3/ticker/price?symbol=SOLUSDT`, {});

  Object.keys(pricingTable).map(key => {
    pricingInSolTable[key] = pricingTable[key] / rlt.data.price;
    return true;
  });

  const mintKey = new PublicKey(tokenList[1].mintAddress);
  const referralKey = new PublicKey(referral);
  const ata = getAssociatedTokenAddressSync(mintKey, address);
  let ixs = [];
  let totalPrice = 0;
  for (let i = 0; i < domains.length; i++) {
    const domain = tokenizeDomain(domains[i]);
    const length = Number(domain.length >= 5 ? 5 : domain.length);
    const reverseKey = getReverseKeySync(domain);
    const acc = await connection.getAccountInfo(reverseKey);
    if (!!acc) {
      continue;
    }
    totalPrice += pricingInSolTable[length] + 0.001;
    try {
      const [, ix] = await registerDomainName(connection, domain, space, address, ata, mintKey, referralKey);
      ixs.push(...ix.flat());
    } catch (err) {}
  }

  if (NATIVE_MINT.equals(mintKey)) {
    const wrap = await wrapSol(connection, ata, address, Math.ceil(totalPrice * Math.pow(10, 9)));
    const unwrap = unwrapSol(ata, address);
    ixs = [...wrap, ...ixs, ...unwrap];
  }
  const tx = await signAndSendInstructions(connection, [], signer, ixs);
  return tx;
};

export const getRentPrice = async (connection: Connection, domains: string[]) => {
  const pricingTable = {
    5: 20, //20
    4: 160, //160
    3: 640, //640
    2: 700, //700
    1: 750, //750
  };
  let rentPrice = 0;
  const pricingInSolTable = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };
  const rlt = await axios.get(`https://binance.com/api/v3/ticker/price?symbol=SOLUSDT`, {});

  Object.keys(pricingTable).map(key => {
    pricingInSolTable[key] = pricingTable[key] / rlt.data.price;
    return true;
  });

  domains.map(item => {
    const len = item.length > 5 ? 5 : item.length;
    rentPrice += pricingInSolTable[len];
    return len;
  });
  return rentPrice;
};

export const getNetworkFee = async (connection: Connection, domains: string[], address: PublicKey) => {
  const pricingTable = {
    5: 20, //20
    4: 160, //160
    3: 640, //640
    2: 700, //700
    1: 750, //750
  };
  const pricingInSolTable = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };
  const rlt = await axios.get(`https://binance.com/api/v3/ticker/price?symbol=SOLUSDT`, {});

  Object.keys(pricingTable).map(key => {
    pricingInSolTable[key] = pricingTable[key] / rlt.data.price;
    return true;
  });

  const mintKey = new PublicKey(tokenList[1].mintAddress);
  const referralKey = new PublicKey(referral);
  const ata = getAssociatedTokenAddressSync(mintKey, address);
  let ixs = [];
  let totalPrice = 0;
  for (let i = 0; i < domains.length; i++) {
    const domain = tokenizeDomain(domains[i]);
    const length = Number(domain.length >= 5 ? 5 : domain.length);
    const reverseKey = getReverseKeySync(domain);
    const acc = await connection.getAccountInfo(reverseKey);
    if (!!acc) {
      continue;
    }
    totalPrice += pricingInSolTable[length] + 0.001;
    try {
      const [, ix] = await registerDomainName(connection, domain, space, address, ata, mintKey, referralKey);
      ixs.push(...ix.flat());
    } catch (err) {
      console.log(err, '-----');
    }
  }

  if (NATIVE_MINT.equals(mintKey)) {
    const wrap = await wrapSol(connection, ata, address, Math.ceil(totalPrice * Math.pow(10, 9)));
    const unwrap = unwrapSol(ata, address);
    ixs = [...wrap, ...ixs, ...unwrap];
  }
  const tx = new Transaction();
  const blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
  tx.recentBlockhash = blockhash;
  tx.feePayer = address;
  tx.add(...ixs);
  const networkFee = await tx.getEstimatedFee(connection);
  return networkFee;
};

export const signAndSendInstructions = async (
  connection: Connection,
  signers: Array<Keypair>,
  feePayer: Keypair,
  txInstructions: Array<TransactionInstruction>,
  skipPreflight = false,
  preflightCommitment: Commitment = 'confirmed',
  confirmCommitment: Commitment = 'confirmed',
): Promise<string> => {
  const tx = new Transaction();

  tx.feePayer = feePayer.publicKey;

  signers.push(feePayer);
  tx.add(...txInstructions);

  const signature = await connection.sendTransaction(tx, signers, {
    skipPreflight,
    preflightCommitment,
  });

  await connection.confirmTransaction(signature, confirmCommitment);
  return signature;
};
