import { ButtonHTMLAttributes } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { getSlicedAddress } from "@/lib/utils";
import { Img } from "react-image";
import { useWeb3Context } from "@/hooks/useWeb3Context";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const ConnectBtn = () => {
	const {
		connectWallet,
		disconnectWallet,
		state: { isAuthenticated, address },
	} = useWeb3Context();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<CustomButton>
					<Img src={"/images/icons/leaf.png"} alt="Wallet" width={20} height={20} className="inline-block mr-2" />
					{isAuthenticated ? getSlicedAddress(address!) : "Connect Wallet"}
				</CustomButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={isAuthenticated ? disconnectWallet : connectWallet}>
					<span>{isAuthenticated ? "Disconnect" : "Click to connect"}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const CustomButton = (props: CustomButtonProps) => {
	return (
		<button
			className="bg-gradient-to-r from-[#FFFFFF]/25 to-[#030114] text-white px-4 py-2 rounded-lg font-semibold shadow font-inter cursor-pointer hover:shadow-lg transition duration-200 ease-in-out flex items-center hover:bg-white/20"
			{...props}>
			{props.children}
		</button>
	);
};

export default ConnectBtn;
