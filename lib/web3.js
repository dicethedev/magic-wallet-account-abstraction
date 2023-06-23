import Web3 from 'web3';

export const createWeb3 = async (magic) => {
  return typeof window !== "undefined" && new Web3(magic.rpcProvider);
};
