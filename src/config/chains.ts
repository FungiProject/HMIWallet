
export const ETH_MAINNET: number = 1;
export const ETH_SEPOLIA = 11155111;
export const ARBITRUM: number = 42161;
export const ARBITRUM_GOERLI: number = 421613;
export const POLYGON: number = 137;
export const POLYGON_MUMBAI: number = 80001;

export const DEFAULT_CHAIN_ID = ARBITRUM;

export const SUPPORTED_CHAIN_IDS = [ARBITRUM,POLYGON];

export function isSupportedChainOrDefault(chainId: number): number {
    return SUPPORTED_CHAIN_IDS.includes(chainId) ? chainId : DEFAULT_CHAIN_ID
}

export function isSupportedChain(chainId: number): boolean {
    return SUPPORTED_CHAIN_IDS.includes(chainId);
}