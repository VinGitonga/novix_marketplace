import { IWeb3Context } from "@/layouts/Web3Provider";
import { createContext, useContext } from "react";

export const Web3Context = createContext<IWeb3Context>({} as IWeb3Context);

export const useWeb3Context = () => useContext(Web3Context);
