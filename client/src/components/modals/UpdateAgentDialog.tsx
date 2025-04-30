import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, SettingsIcon } from "lucide-react";
import AppCombobox from "../form/AppCombobox";
import { IOption } from "@/types/Option";
import { z } from "zod";
import AppInput from "../form/AppInput";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IAgent } from "@/types/Agent";
import { useState } from "react";
import useAgentsUtils from "@/hooks/useAgentsUtils";
import { toast } from "sonner";
import useDisclosure from "@/hooks/useDisclosure";

const pricingCategory = [
	{
		value: "free",
		label: "Free",
	},
	{
		value: "subscription",
		label: "Subscription",
	},
	{
		value: "one-time",
		label: "One-time",
	},
] satisfies IOption[];

const formSchema = z.object({
	pricingModel: z.string().min(1, "Please choose pricing type"),
	credits: z.coerce.string().transform((val) => {
		const parsed = parseFloat(val);
		if (isNaN(parsed)) {
			throw new Error("Invalid no of credits");
		}
		return String(parsed);
	}),

	price: z.coerce.string().transform((val) => {
		const parsed = parseFloat(val);
		if (isNaN(parsed)) {
			throw new Error("Invalid price");
		}
		return String(parsed);
	}),
});

interface ConfigurePricingDialogProps {
	agentData: IAgent;
	mutate?: VoidFunction;
}

function ConfigurePricingDialog({ agentData, mutate }: ConfigurePricingDialogProps) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
	const formMethods = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { pricingModel: "", price: "", credits: "" } });

	const { updatePricingData } = useAgentsUtils();

	const { control, handleSubmit, reset } = formMethods;

	const onSubmit = handleSubmit(async (data) => {
		console.log('data', data)
		setIsLoading(true);
		const price = Number(data.price);
		let creditsData = data.pricingModel === "free" ? 10000 : Number(data.credits);
		const pricingModel = data.pricingModel;
		try {
			const resp = await updatePricingData(price, creditsData, pricingModel, agentData._id);
			if (resp?.status === "success") {
				reset();
				mutate?.();
				toast.success("Updated successfully");
				onClose();
			} else {
				toast.error("Unable to update pricing at the moment");
			}
		} catch (err) {
			toast.error("Unable to update pricing at the moment");
		} finally {
			setIsLoading(false);
		}
	});
	return (
		<>
			<Button className="dark" size={"icon"} onClick={onOpen}>
				<SettingsIcon />
			</Button>
			<Dialog open={isOpen} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[425px] bg-[#010B0F] text-white">
					<DialogHeader>
						<DialogTitle>Update Agent Payment Info</DialogTitle>
						<DialogDescription>Make changes to your AI Agent here pricing. Click save when you're done.</DialogDescription>
					</DialogHeader>
					<FormProvider {...formMethods}>
						<form onSubmit={onSubmit}>
							<div className="space-y-4 mb-4">
								<AppCombobox label="Choose pricing category" placeholder="Select pricing category" options={pricingCategory} name="pricingModel" control={control} />
								<AppInput label="Credits" placeholder="No of Credeits" name="credits" control={control} type="number" helperText="These are the no of credits for testing this agent for a user" />
								<AppInput label="Price" placeholder="Enter price" name="price" control={control} type="number" />
							</div>
							<DialogFooter>
								<Button type="submit" className="dark" disabled={isLoading}>
									{isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
									Save changes
								</Button>
							</DialogFooter>
						</form>
					</FormProvider>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default ConfigurePricingDialog;
