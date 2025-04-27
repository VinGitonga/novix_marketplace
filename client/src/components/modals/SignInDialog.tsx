import useDisclosure from "@/hooks/useDisclosure";
import AppInput from "../form/AppInput";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

const SignInDialog = () => {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	return (
		<>
			<Button variant={"secondary"} className="cursor-pointer dark" onClick={onOpen}>
				Sign In
			</Button>
			<Dialog open={isOpen} onOpenChange={onOpenChange}>
				<DialogContent className="bg-[#010B0F] text-white w-md">
					<DialogHeader>
						<DialogTitle>Sign In</DialogTitle>
						<DialogDescription>Sign in to your account to start enjoying features</DialogDescription>
					</DialogHeader>
					<div className="space-y-5">
						<AppInput label="Username" placeholder="@rabbitlabs" />
					</div>
					<DialogFooter></DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default SignInDialog;
