import { Contract, ethers } from 'ethers';

import baseRegisterContract from '@/assets/BNBBaseRegister.json';
import bnbRegisterContract from '@/assets/BNBRegister.json';
import ensBaseRegisterContract from '@/assets/ENSBaseRegister.json';
import ensRegisterContract from '@/assets/ENSRegister.json';

export const getBNBRegisterContract = (address: string, provider: ethers.providers.JsonRpcProvider) => {
  return new Contract(address, bnbRegisterContract, provider);
};

export const getBNBBaseRegisterContract = (address: string, provider: ethers.providers.JsonRpcProvider) => {
  return new Contract(address, baseRegisterContract, provider);
};

export const getENSBaseRegisterContract = (address: string, provider: ethers.providers.AlchemyProvider) => {
  return new Contract(address, ensBaseRegisterContract, provider);
};

export const getENSRegisterContract = (address: string, provider: ethers.providers.AlchemyProvider) => {
  return new Contract(address, ensRegisterContract, provider);
};
