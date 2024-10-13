import { Magic } from "magic-sdk";

const createMagic = (key) => {
  const customNodeOptions = {
    rpcUrl:
      "https://polygon-amoy.g.alchemy.com/v2/QhX9G8vQR3YeqhRIeN544pODvrS1LxNR", // Polygon RPC URL
    chainId: 80002, // Polygon chain id
    // rpcUrl:
    //   "https://eth-sepolia.g.alchemy.com/v2/FRC9i8y6nwyWBdY1i3ahDh68Eeoqh2tt",
    // chainId: 11155111, // Sepolia chain Id
  };

  return (
    typeof window !== "undefined" &&
    new Magic(key, {
      network: customNodeOptions,
    })
  );
};

export const magic = createMagic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
