import Web3ContextProvider from "@/layouts/Web3Provider";
import router from "@/router";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import HashinalWalletProvider from "./HashinalWalletProvider";

const AppProvider = () => {
	return (
		<HelmetProvider>
			<HashinalWalletProvider>
				<Web3ContextProvider>
					<RouterProvider router={router} />
				</Web3ContextProvider>
				<Toaster />
			</HashinalWalletProvider>
		</HelmetProvider>
	);
};

export default AppProvider;
