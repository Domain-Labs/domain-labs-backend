import { normalize } from '@ensdomains/eth-ens-namehash';

const sha3 = require('js-sha3').keccak_256;

export const encodeLabelhash = (hash: string) => {
  if (!hash.startsWith('0x')) {
    throw new Error('Expected label hash to start with 0x');
  }

  if (hash.length !== 66) {
    throw new Error('Expected label hash to have a length of 66');
  }

  return `[${hash.slice(2)}]`;
};

export const decodeLabelhash = (hash: string) => {
  if (!(hash.startsWith('[') && hash.endsWith(']'))) {
    throw Error('Expected encoded labelhash to start and end with square brackets');
  }

  if (hash.length !== 66) {
    throw Error('Expected encoded labelhash to have a length of 66');
  }

  return `${hash.slice(1, -1)}`;
};

export const isEncodedLabelhash = (hash: string) => {
  return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66;
};

export const isDecrypted = (name: string) => {
  const nameArray = name.split('.');
  const decrypted = nameArray.reduce((acc, label) => {
    if (acc === false) return false;
    return isEncodedLabelhash(label) ? false : true;
  }, true);

  return decrypted;
};

export const labelhash = (unnormalisedLabelOrLabelhash: string) => {
  if (unnormalisedLabelOrLabelhash === '[root]') {
    return '';
  }
  return isEncodedLabelhash(unnormalisedLabelOrLabelhash)
    ? '0x' + decodeLabelhash(unnormalisedLabelOrLabelhash)
    : '0x' + sha3(normalize(unnormalisedLabelOrLabelhash));
};
