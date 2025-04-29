import { Img } from "react-image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useWallet } from "@/providers/HashinalWalletProvider";
import { Loader2 } from "lucide-react";
import useDisclosure from "@/hooks/useDisclosure";
import AppInput from "../form/AppInput";
import { Button } from "../ui/button";
import useAccountUtils from "@/hooks/useAccountUtils";
import { useAuthStore } from "@/hooks/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	username: z.string().min(1, "Username is required"),
});

const HashinalConnectBtn = () => {
	const { connect, disconnect, accountId, isConnecting } = useWallet();
	const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();

	const { getAccountDetails, createUserAccont } = useAccountUtils();
	const { setAccount } = useAuthStore();
	const navigate = useNavigate();
	const [loading, setLoading] = useState<boolean>(false);

	const formMethods = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { name: "", username: "" } });

	const { handleSubmit, reset, control } = formMethods;

	const onClickConnect = async () => {
		const selectedAccId = await connect();
		console.log("selectedAccId", selectedAccId);
		setTimeout(async () => {
			try {
				if (selectedAccId) {
					// if we've an account, we get account from db
					const resp = await getAccountDetails(selectedAccId);

					if (resp?.status === "success") {
						if (resp?.data) {
							setAccount(resp?.data!);
						} else {
							// no account trigger to create
							onOpen();
						}
					} else {
						setAccount(null);
					}
				}
			} catch (err) {
				console.log(err);
			}
		}, 500);
	};

	const onClickDisconnect = async () => {
		await disconnect();
		setAccount(null);
		navigate("/");
	};

	const onSubmit = handleSubmit(async (data) => {
		const infoData = {
			name: data.name,
			username: data.username,
			accountId: accountId!,
		};

		setLoading(true);
		try {
			const resp = await createUserAccont(infoData);

			if (resp?.status === "success") {
				toast.success("Account saved successfully");
				setAccount(resp?.data!);
				reset();
				onClose();
			} else {
				toast.error("Unable to save account details. Please try again later");
			}
		} catch (err) {
			toast.error("Unable to save account details. Please try again later");
		} finally {
			setLoading(false);
		}
	});
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="bg-gradient-to-r from-[#FFFFFF]/25 to-[#030114] text-white px-4 py-2 rounded-lg font-semibold shadow font-inter cursor-pointer hover:shadow-lg transition duration-200 ease-in-out flex items-center hover:bg-white/20">
						{isConnecting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Img src={"/images/icons/leaf.png"} alt="Wallet" width={20} height={20} className="inline-block mr-2" />}
						{accountId ? accountId : "Connect Wallet"}
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={accountId ? onClickDisconnect : onClickConnect}>
						<span>{accountId ? "Disconnect" : "Click to connect"}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Dialog open={isOpen} onOpenChange={onOpenChange}>
				<DialogContent className="bg-[#010B0F] text-white w-md">
					<DialogHeader>
						<DialogTitle>Create an Account</DialogTitle>
						<DialogDescription>Create an account to start exploring AI Agents in the marketplace with ease.</DialogDescription>
					</DialogHeader>
					<FormProvider {...formMethods}>
						<form onSubmit={onSubmit}>
							<div className="space-y-5">
								<AppInput label="Name" placeholder="Rabbit" name="name" control={control} />
								<AppInput label="Username" placeholder="@rabbitlabs" name="username" control={control} />
							</div>
							<DialogFooter className="mt-3">
								<Button type="submit" disabled={loading}>
									{loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
									Save
								</Button>
							</DialogFooter>
						</form>
					</FormProvider>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default HashinalConnectBtn;
