import { Web3Context } from "@/hooks/useWeb3Context";
import useWeb3Provider, { IWeb3State } from "@/hooks/useWeb3Provider";
import { FC, ReactNode } from "react";

export interface IWeb3Context {
	connectWallet: () => Promise<any>;
	disconnectWallet: () => void;
	state: IWeb3State;
}

type IProps = {
	children: ReactNode;
};

const Web3ContextProvider: FC<IProps> = ({ children }) => {
	const { connectWallet, disconnectWallet, state } = useWeb3Provider();

	return <Web3Context.Provider value={{ connectWallet, disconnectWallet, state }}>{children}</Web3Context.Provider>;
};

export default Web3ContextProvider;
