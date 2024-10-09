import { Magic } from "magic-sdk";

const createMagic = (key) => {
  const customNodeOptions = {
    // rpcUrl: 'https://matic-mumbai.chainstacklabs.com', // Polygon RPC URL
    // chainId: 80001, // Polygon chain id
    rpcUrl:
      "https://eth-sepolia.g.alchemy.com/v2/FRC9i8y6nwyWBdY1i3ahDh68Eeoqh2tt",
    chainId: 11155111, // Sepolia chain Id
  };

  return (
    typeof window !== "undefined" &&
    new Magic(key, {
      network: customNodeOptions,
    })
  );
};

export const magic = createMagic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
