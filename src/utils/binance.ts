import { BNB_BASE_REGISTER_ADDR, BNB_REGISTER_ADDR } from '@/config';
import { BigNumber, Contract, ContractTransaction, Signer, ethers } from 'ethers';
import { calculateDuration, getBufferedPrice } from './utils';
import { getBNBBaseRegisterContract, getBNBRegisterContract } from './contracts';

import { DomainStatus } from '@/interfaces/domain.interface';
import { labelhash } from './labelhash';
import { validateName } from '@siddomains/sidjs';

const SID = require('@siddomains/sidjs').default;
const SIDfunctions = require('@siddomains/sidjs');

export const checkAvailable = async (provider: ethers.providers.JsonRpcProvider, name: string): Promise<DomainStatus> => {
  const Register = getBNBRegisterContract(BNB_REGISTER_ADDR, provider);
  const available = await Register['available(string)'](name);
  if (!available) {
    const sid = new SID({
      provider,
      sidAddress: SIDfunctions.getSidAddress('56'),
    });
    const address = await sid.name(`${name}.bnb`).getAddress(); // 0x123
    const expiry = await getExpiryDate(name, provider);
    return {
      name,
      type: 'BNB',
      registered: true,
      expiration: expiry,
      owner: address,
    };
  } else {
    return {
      name,
      type: 'BNB',
      registered: false,
    };
  }
};

export const getExpiryDate = async (name: string, provider: ethers.providers.JsonRpcProvider) => {
  const Register = getBNBBaseRegisterContract(BNB_BASE_REGISTER_ADDR, provider);
  const labelhashedName = labelhash(name);
  const expiry = await Register['nameExpires(uint256)'](labelhashedName);
  return expiry;
};

export const getPublicResolver = async (provider: ethers.providers.JsonRpcProvider) => {
  const sid = new SID({ provider: provider, sidAddress: SIDfunctions.getSidAddress('56') });
  return sid.name(`sid-resolver.bnb`).getAddress();
};

export const getRentPrice = async (label: string, year: number, registrarController: Contract): Promise<BigNumber> => {
  const normalizedName = validateName(label);
  if (normalizedName !== label) throw new Error('unnormalized name');

  const res = await registrarController.rentPrice(normalizedName, calculateDuration(year));
  return res[0].add(res[1]);
};

export const getNetworkFee = async (
  label: string,
  address: string,
  year: number,
  provider: ethers.providers.JsonRpcProvider,
  registrarController: Contract,
): Promise<BigNumber> => {
  const normalizedName = validateName(label);
  if (normalizedName !== label) throw new Error('unnormailzed name');
  if (year < 1) throw new Error('minimum registration for one year');

  const duration = calculateDuration(year);

  const publicResolver = await getPublicResolver(provider);
  const priceRes = await getRentPrice(normalizedName, year, registrarController);
  const bufferedPrice = getBufferedPrice(priceRes);
  const gas = await registrarController.estimateGas?.register(normalizedName, address, duration, {
    value: bufferedPrice,
  });
  console.log(gas, 'gas Limit');
  const gasLimit = (gas ?? BigNumber.from(0)).add(21000);
  return gasLimit;
};

export const register = async (
  label: string,
  address: string,
  year: number,
  provider: ethers.providers.JsonRpcProvider,
  registrarController: Contract,
  signer: Signer,
) => {
  const normalizedName = validateName(label);
  if (normalizedName !== label) throw new Error('unnormailzed name');
  if (year < 1) throw new Error('minimum registration for one year');

  const duration = calculateDuration(year);

  const publicResolver = await getPublicResolver(provider);
  const priceRes = await getRentPrice(normalizedName, year, registrarController);
  const bufferedPrice = getBufferedPrice(priceRes);
  registrarController.connect(signer);
  const gas = await registrarController.estimateGas?.registerWithConfigAndPoint(normalizedName, address, duration, publicResolver, false, false, [], {
    value: bufferedPrice,
  });
  const gasLimit = (gas ?? BigNumber.from(0)).add(21000);
  const valuableTx: ContractTransaction = await registrarController.registerWithConfigAndPoint(
    normalizedName,
    address,
    duration,
    publicResolver,
    false,
    false,
    [],
    {
      value: bufferedPrice,
      gasLimit,
    },
  );
  await valuableTx.wait();
  return normalizedName;
};
