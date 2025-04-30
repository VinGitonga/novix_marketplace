import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useDisclosure from "@/hooks/useDisclosure";
import { IAgent } from "@/types/Agent";

interface BuyDialogProps {
	agentData: IAgent;
}

function BuyDialog({ agentData }: BuyDialogProps) {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
	return (
		<>
			<Button
				onClick={onOpen}
				className="bg-gradient-to-r from-[#FFFFFF]/25 to-[#0A0248] text-white px-4 py-2 rounded-lg font-semibold shadow font-inter cursor-pointer hover:shadow-lg transition duration-200 ease-in-out flex items-center hover:bg-white/20">
				Buy the Agent
			</Button>
			<Dialog open={isOpen} onOpenChange={onOpenChange}>
				<DialogContent className="sm:min-w-[425px] bg-[#010B0F] text-white">
					<DialogHeader>
						<DialogTitle>Purchase AI Agent</DialogTitle>
						<DialogDescription>Buy the agent using Hedera</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4 w-full">
						<div className="grid grid-cols-4 gap-4">
							<h2 className="font-semibold">Agent Name: </h2>
							<Badge className="col-span-2">
								<p className="">{agentData?.name}</p>
							</Badge>
						</div>
						<div className="grid grid-cols-4 gap-4">
							<h2 className="font-semibold">Pricing Type: </h2>
							<Badge className="col-span-2">
								<p className="">{agentData?.pricingModel}</p>
							</Badge>
						</div>
						<div className="grid grid-cols-4 gap-4">
							<h2 className="font-semibold">Amount: </h2>
							<Badge className="col-span-2">
								<p className="">{agentData?.price} HBAR</p>
							</Badge>
						</div>
					</div>
                    <div className="w-full">
                        <Button className="w-full cursor-pointer">Pay with Hedera</Button>
                    </div>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default BuyDialog;
