import { DomainType } from './domain.interface';

export interface Domain {
  type: DomainType;
  name: string;
  status: boolean; //delivered or not
}

export interface User {
  address: string;
  solAddress: string;
  email?: string;
  chain: DomainType;
  balance: number;
  paidBalance: number;
  domains: [Domain];
  completed: boolean;
  checksum: string;
}
