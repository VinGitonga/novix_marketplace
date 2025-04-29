import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { SignClientTypes } from "@walletconnect/types";
import { HashinalsWalletConnectSDK } from "@hashgraphonline/hashinal-wc";
import { LedgerId, PrivateKey } from "@hashgraph/sdk";
import { WALLET_CONNECT_PROJECT_ID } from "@/env";
import { BrowserHCSClient } from "@hashgraphonline/standards-sdk";

interface HCS2Message {
	p: "hcs2-2";
	op: "register" | "delete" | "update" | "migrate";
	t_id?: string;
	uid?: string;
	metadata?: string;
	m?: string;
}

interface WalletContextType {
	connect: () => Promise<string | null | undefined>;
	disconnect: () => Promise<void>;
	accountId: string | null;
	balance: string | null;
	isConnecting: boolean;
	submitHCS2Message: (message: HCS2Message, topicId: string, submitKey?: string) => Promise<any>;
	transferHBAR: (recipientId: string, amount: number) => Promise<any>;
	browserHcsClient: BrowserHCSClient | null;
}

const HashinalWalletContext = createContext<WalletContextType>({} as WalletContextType);

const APP_METADATA: SignClientTypes.Metadata = {
	name: "Novix",
	description: "Decentralized AI Agents Marketplace",
	url: window.location.origin,
	icons: [],
};

const HashinalWalletProvider = ({ children }: { children: ReactNode }) => {
	const [accountId, setAccountId] = useState<string | null>(null);
	const [balance, setBalance] = useState<string | null>(null);
	const [isConnecting, setIsConnecting] = useState<boolean>(false);
	const [sdk, setSdk] = useState<HashinalsWalletConnectSDK | null>(null);
	const [browserHcsClient, setBrowserHcsClient] = useState<BrowserHCSClient | null>(null);

	useEffect(() => {
		const initSDK = async () => {
			try {
				const sdkInstance = HashinalsWalletConnectSDK.getInstance();

				await sdkInstance.init(WALLET_CONNECT_PROJECT_ID, APP_METADATA, LedgerId.TESTNET);

				setSdk(sdkInstance);

				const savedAccount = await sdkInstance.initAccount(WALLET_CONNECT_PROJECT_ID, APP_METADATA);

				console.log(savedAccount);

				console.log(sdkInstance?.dAppConnector);

				if (savedAccount) {
					setAccountId(savedAccount.accountId);
					setBalance(savedAccount.balance);
				}

				if (sdkInstance) {
					console.log("Here");
					const client = new BrowserHCSClient({ network: "testnet", hwc: sdkInstance });
					setBrowserHcsClient(client);
				}
			} catch (err) {
				console.log("Failed to init sdk", err);
			}
		};

		initSDK();
	}, []);

	const connect = useCallback(async () => {
		if (!sdk) return null;

		try {
			setIsConnecting(true);
			const { accountId: newAccountId, balance: newBalance } = await sdk.connectWallet(WALLET_CONNECT_PROJECT_ID, APP_METADATA);

			setAccountId(newAccountId);
			setBalance(newBalance);
			console.log("accountId", accountId);
			setIsConnecting(false);
			return accountId;
		} catch (err) {
			console.error("Failed to connect wallet", err);
			setIsConnecting(false);
			return null;
			// throw err;
		}
	}, [sdk]);

	const disconnect = useCallback(async () => {
		if (!sdk) return;

		try {
			await sdk.disconnect();
			setAccountId(null);
			setBalance(null);
		} catch (err) {
			console.log("Failed to disconnect the wallet", err);
			// throw err;
		}
	}, [sdk]);

	const submitHCS2Message = useCallback(
		async (message: HCS2Message, topicId: string, submitKey?: string) => {
			if (!sdk) throw new Error("SDK not init");

			try {
				if (message.m && message.m.length > 500) {
					throw new Error("Memo must not exceed 500 characters");
				}

				if (!message.p || message.p !== "hcs2-2") {
					throw new Error("Invalid protocol. Must be hcs-2");
				}

				const messageString = JSON.stringify(message);

				// if submit key is provided, convert it to a private key objetc
				const privateKey = submitKey ? PrivateKey.fromString(submitKey) : undefined;

				const receipt = await sdk.submitMessageToTopic(topicId, messageString, privateKey);

				console.log("HCS2 message submitted successfully.");
				console.log("Transaction ID:", receipt);

				return receipt;
			} catch (err) {
				console.log("Erorr submitting HCS-2 Message", err);
			}
		},
		[sdk]
	);

	const transferHBAR = useCallback(
		async (recipientId: string, amount: number) => {
			if (!sdk || !accountId) {
				throw new Error("SDK not init yet");
			}

			try {
				const receipt = await sdk.transferHbar(accountId, recipientId, amount);

				console.log("HBAR Transfer successful", receipt);
				return receipt;
			} catch (err) {
				console.log("Transfer failed:", err);
			}
		},
		[sdk, accountId]
	);

	return <HashinalWalletContext.Provider value={{ connect, disconnect, accountId, balance, isConnecting, submitHCS2Message, transferHBAR, browserHcsClient }}>{children}</HashinalWalletContext.Provider>;
};

export const useWallet = () => useContext(HashinalWalletContext);

export default HashinalWalletProvider;
