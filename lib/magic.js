import { Magic } from "magic-sdk";

const createMagic = (key) => {
  const customNodeOptions = {
    rpcUrl: 'https://matic-mumbai.chainstacklabs.com', // Polygon RPC URL
    chainId: 80001, // Polygon chain id
  }

  return typeof window !== "undefined" && new Magic(key, {
    network: customNodeOptions
  });
};

export const magic = createMagic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);