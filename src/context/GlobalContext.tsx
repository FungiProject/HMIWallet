import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { MagicSigner } from "@alchemy/aa-signers/magic";
import { AlchemyMultichainClient } from "@/lib/alchemy/AlchemyMultichainClient";
import {
    getProviderMultichainSetting,
    getProviderDefaultSettings,
} from "@/config/alchemyConfig";
import { Alchemy } from "alchemy-sdk";
import { ARBITRUM, BASE } from "@/config/chains";
import { getApiKeyChain } from "@/config/alchemyConfig";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { getViemChain } from "@/config/chains";
import { MagicMultichainClient } from "@/lib/magic/MagicMultichainClient";
import { AlchemySmartAccountClient } from "@alchemy/aa-alchemy";
// import { useUserOperations } from '@/hooks/useUserOperations';

import { type Address, type SmartAccountSigner } from "@alchemy/aa-core";

export type FungiGlobalContextType = {
    alchemyClient?: Alchemy;
    alchemyScaProvider: any | undefined;
    scaAddress?: Address;
    chain: number;
    switchNetwork: (number) => void;
    isConnected: boolean;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
};

export const FungiGlobalContext = createContext({} as FungiGlobalContextType);

export function useGlobalContext() {
    return useContext(FungiGlobalContext) as FungiGlobalContextType;
}

// FungiGlobalContextProvider.tsx
export function FungiGlobalContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [alchemyMultichainClient, setAlchemyMultichainClient] =
        useState<AlchemyMultichainClient>();
    const [magicMultichainClient, setMagicMultichainClient] =
        useState<MagicMultichainClient>();

    const [alchemyClient, setAlchemyClient] = useState<Alchemy>();
    const [alchemyScaProvider, setAlchemyScaProvider] =
        useState<AlchemySmartAccountClient>();
    const [magicClient, setMagicClient] =
        useState<Promise<MagicSigner | undefined>>();

    const [scaAddress, setScaAddress] = useState<Address>();
    const [chain, setChain] = useState(BASE);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // BatchContext
    // const [batchedOperations, setBatchedOperations] = useState<any[]>([]);
    // const { sendUserOperations } = useUserOperations();

    // const addOperationToBatch = (operation: any) => {
    //     setBatchedOperations(prev => [...prev, operation]);
    // };

    // const executeBatchedOperations = async (): Promise<string | undefined> => {
    //     if (batchedOperations.length > 0) {
    //         const txHash = await sendUserOperations(batchedOperations); // Sending the list of operations
    //         setBatchedOperations([]);
    //         return txHash;
    //     }
    //     return undefined;
    // };

    useEffect(() => {
        const defaultAlchemySettings = getProviderDefaultSettings(BASE);
        const overridesAlchemySettings = getProviderMultichainSetting();
        const multichainProv = new AlchemyMultichainClient(
            defaultAlchemySettings,
            overridesAlchemySettings,
        );
        setAlchemyMultichainClient(multichainProv);

        setAlchemyClient(
            multichainProv?.forNetwork(chain) ||
                multichainProv?.forNetwork(BASE),
        );
        console.log("ac from gc", alchemyClient);
        const magicMultichain = new MagicMultichainClient();
        setMagicMultichainClient(magicMultichain);
        setMagicClient(magicMultichain.forNetwork(BASE));
    }, []);

    useEffect(() => {
        console.log("FungiGlobalContext: change chain");
        if (chain) {
            if (alchemyMultichainClient) {
                setAlchemyClient(
                    alchemyMultichainClient?.forNetwork(chain) ||
                        alchemyMultichainClient?.forNetwork(BASE),
                );
                /*setAlchemyScaProvider(
          alchemyMultichainClient?.forNetworkScProvider(chain)
        );*/
            }

            if (magicMultichainClient) {
                const magicForNetwork = magicMultichainClient.forNetwork(chain);
                if (magicForNetwork) {
                    setMagicClient(magicForNetwork);
                    (async () => {
                        await login();
                    })();
                }
            }
        }
    }, [chain]);

    useEffect(() => {
        (async () => {
            if (alchemyScaProvider) {
                console.log(alchemyScaProvider.account?.address);
                if (alchemyScaProvider) {
                    setScaAddress(alchemyScaProvider.account?.address);
                    if (alchemyScaProvider?.account?.address) {
                        localStorage.setItem(
                            "scaAddress",
                            alchemyScaProvider?.account?.address.toString(),
                        );
                    }
                }
            }
        })();
    }, [alchemyScaProvider]);

    const connectProviderToAccount = useCallback(
        async (signer: SmartAccountSigner) => {
            console.log("FungiGlobalContext: connectProviderToAccount");

            const connectedProvider = await createModularAccountAlchemyClient({
                apiKey: getApiKeyChain(chain),
                chain: getViemChain(chain),
                signer,
            });

            console.log(connectedProvider);
            setAlchemyScaProvider(connectedProvider);

            return connectedProvider;
        },
        [alchemyScaProvider, chain],
    );

    //TODO ya no sirve?
    const disconnectProviderFromAccount = useCallback(() => {
        if (!alchemyScaProvider) {
            return;
        }
        const disconnectedProvider = alchemyScaProvider;

        setAlchemyScaProvider(disconnectedProvider);
        return disconnectedProvider;
    }, [alchemyScaProvider]);

    const login = useCallback(async () => {
        console.log("FungiGlobalContext: login");
        const signer = await magicClient;

        if (signer == null) {
            throw new Error("Magic not initialized");
        }

        await signer.authenticate({
            authenticate: async () => {
                await signer.inner.wallet.connectWithUI();
            },
        });

        await connectProviderToAccount(signer as SmartAccountSigner);

        let signerAddress;
        (async () => {
            signerAddress = await signer.getAddress();
        })();

        setScaAddress(
            alchemyScaProvider?.getAddress({ account: signerAddress }),
        );
        setIsConnected(true);
    }, [magicClient, connectProviderToAccount, alchemyScaProvider]);

    const logout = useCallback(async () => {
        const signer = await magicClient;

        if (!signer) {
            return;
        }

        if (!(await signer.inner.user.logout())) {
            throw new Error("Magic logout failed");
        }

        setIsConnected(false);
        disconnectProviderFromAccount();
        setScaAddress(undefined);
    }, [magicClient, disconnectProviderFromAccount]);

    const switchNetwork = useCallback((chainId: number) => {
        setChain(chainId);
    }, []);

    const state: FungiGlobalContextType = useMemo(() => {
        return {
            alchemyClient,
            alchemyScaProvider,
            scaAddress,
            chain,
            switchNetwork,
            isLoading,
            isConnected,
            login,
            logout,
            // batchedOperations,
            // addOperationToBatch,
        };
    }, [
        alchemyClient,
        scaAddress,
        switchNetwork,
        login,
        alchemyScaProvider,
        chain,
        isLoading,
        isConnected,
        logout,
        // batchedOperations,
        // addOperationToBatch,
    ]);

    return (
        <FungiGlobalContext.Provider value={state}>
            {children}
        </FungiGlobalContext.Provider>
    );
}
