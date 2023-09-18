import { BigNumber, Contract, ContractTransaction, Signer, ethers, utils } from 'ethers';
import { ENS_BASE_REGISTER_ADDR, ENS_REGISTER_ADDR } from '@/config';
import { calculateDuration, getBufferedPrice, wait } from './utils';
import { getENSBaseRegisterContract, getENSRegisterContract } from './contracts';

import { DomainStatus } from '@/interfaces/domain.interface';
import { labelhash } from './labelhash';
import { validateName } from '@siddomains/sidjs';

export const ENS_COMMITMENT_TIME = 60;

export const checkAvailable = async (provider: ethers.providers.AlchemyProvider, name: string): Promise<DomainStatus> => {
  const Register = getENSRegisterContract(ENS_REGISTER_ADDR, provider);
  const available = await Register['available(string)'](name);
  if (!available) {
    const address = await provider.resolveName(`${name}.eth`);
    const expiry = await getExpiryDate(name, provider);
    return {
      name,
      type: 'ETH',
      registered: true,
      expiration: expiry,
      owner: String(address),
    };
  } else {
    return {
      name,
      type: 'ETH',
      registered: false,
    };
  }
};

export const getExpiryDate = async (name: string, provider: ethers.providers.AlchemyProvider) => {
  const Register = getENSBaseRegisterContract(ENS_BASE_REGISTER_ADDR, provider);
  const labelhashedName = labelhash(name);
  const expiry = await Register['nameExpires(uint256)'](labelhashedName);
  return expiry;
};

export const getPublicResolver = async (provider: ethers.providers.AlchemyProvider) => {
  const address = await provider.resolveName('resolver.eth');
  return address;
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
  provider: ethers.providers.AlchemyProvider,
  registrarController: Contract,
): Promise<BigNumber> => {
  const normalizedName = validateName(label);
  if (normalizedName !== label) throw new Error('unnormailzed name');
  if (year < 1) throw new Error('minimum registration for one year');

  // const duration = calculateDuration(year);
  // const publicResolver = await getPublicResolver(provider);
  // const priceRes = await getRentPrice(normalizedName, year, registrarController);
  // const bufferedPrice = getBufferedPrice(priceRes);
  // // registrarController.connect(signer);
  // const secret = genCommitSecret();
  // console.log(publicResolver, normalizedName, address, duration, secret, 'public resolver');
  // const gas = await registrarController.estimateGas?.register(normalizedName, address, duration, secret, publicResolver, [], true, 0, {
  //   value: bufferedPrice,
  // });
  // console.log(gas, 'eth gas limit');
  const gasPrice = await provider.getGasPrice();
  const gasLimit = gasPrice.mul(BigNumber.from(500000).mul(year));
  console.log(gasLimit, 'ethereum gas limit');
  return gasLimit;
};

export const register = async (
  label: string,
  address: string,
  year: number,
  provider: ethers.providers.AlchemyProvider,
  registrarController: Contract,
  signer: Signer,
) => {
  const normalizeName = validateName(label);
  const publicResolver = await getPublicResolver(provider);
  const secret = genCommitSecret();
  const commitment = await registrarController.makeCommitmentWithConfig(normalizeName, address, secret, publicResolver, address);
  const tx = await registrarController.commit(commitment);
  await tx?.wait();
  const checkRes = await registrarController.commitments(commitment);
  const createTime = checkRes?.toNumber() ?? 0;
  if (createTime > 0) {
    await wait(ENS_COMMITMENT_TIME * 1000);
  } else {
    throw new Error('commitment error');
  }
  const duration = calculateDuration(year);
  const priceRes = await getRentPrice(normalizeName, year, registrarController);
  const bufferedPrice = getBufferedPrice(priceRes);
  //connect signer
  registrarController.connect(signer);
  const gas = await registrarController.estimateGas?.register(normalizeName, address, duration, secret, publicResolver, [], false, 0, {
    value: bufferedPrice,
  });
  const gasLimit = (gas ?? BigNumber.from(0)).add(21000);
  const valuableTx: ContractTransaction = await registrarController?.register(
    normalizeName,
    address,
    duration,
    secret,
    publicResolver,
    [],
    false,
    0,
    {
      value: bufferedPrice,
      gasLimit: gasLimit ? BigNumber.from(gasLimit) : undefined,
    },
  );
  await valuableTx.wait();
  return normalizeName;
};

export function genCommitSecret() {
  return utils.hexlify(utils.randomBytes(32));
}
