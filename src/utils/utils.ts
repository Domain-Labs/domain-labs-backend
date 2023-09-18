import { BigNumber } from 'ethers';

export const YEAR_IN_SECONDS = 31536000;

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function calculateDuration(years: number) {
  return BigNumber.from(parseInt((years * YEAR_IN_SECONDS).toFixed()));
}

export function getBufferedPrice(price: BigNumber) {
  return price.mul(110).div(100);
}
