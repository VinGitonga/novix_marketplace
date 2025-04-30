"use client";
import { cn } from "@/lib/utils";
import { IOption } from "@/types/Option";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import useDisclosure from "@/hooks/useDisclosure";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";

type CommonProps = {
	label?: string;
	helperText?: string;
	placeholder?: string;
	options: IOption[];
};

interface UnControlledProps extends CommonProps {
	value?: string;
	setValue?: (val: string) => void;
}

interface ControlledProps extends CommonProps {
	name: string;
	control: Control<any>;
}

type AppComboboxProps = UnControlledProps | ControlledProps;

const AppCombobox = (props: AppComboboxProps) => {
	const { isOpen, onOpenChange, onClose } = useDisclosure();

	const { label, placeholder = "Choose ...", options, helperText } = props;

	console.log("props", props);

	const isControlled = "control" in props;

	if (isControlled) {
		const { name, control } = props;

		return (
			<FormField
				name={name}
				control={control}
				render={({ field }) => (
					<FormItem>
						{label && <FormLabel className="font-inter">{label}</FormLabel>}
						<Popover open={isOpen} onOpenChange={onOpenChange}>
							<PopoverTrigger asChild>
								<FormControl>
									<Button variant="outline" role="combobox" className={cn("flex justify-between dark font-inter", !field.value && "text-muted-foreground")}>
										{field.value ? (
											<Badge color="primary" className="text-[12px] dark">
												{options.find((language) => language.value === field?.value)?.label}
											</Badge>
										) : (
											placeholder
										)}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</FormControl>
							</PopoverTrigger>
							<PopoverContent className="w-[400px] bg-[#010B0F] text-white p-0 font-inter">
								<Command className="bg-[#010B0F] text-white dark">
									<CommandInput placeholder={placeholder} className="dark" />
									<CommandList>
										<CommandEmpty>No option found</CommandEmpty>
										<CommandGroup>
											{options?.map((opt) => (
												<CommandItem
													value={opt.label}
													key={opt.value}
													onSelect={() => {
														console.log("selected", field?.value);
														field?.onChange(opt.value);
														onClose();
													}}>
													<CheckIcon className={cn("mr-2 h-4 w-4", opt.value === field?.value ? "opacity-100" : "opacity-0")} />
													{opt.label}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</FormItem>
				)}
			/>
		);
	}

	const { value, setValue } = props;
	return (
		<div className="flex flex-col">
			{label && <p className="text-sm mb-2">{label}</p>}
			<Popover open={isOpen} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>
					<Button variant="outline" role="combobox" className={cn("flex justify-between dark font-inter", !value && "text-muted-foreground")}>
						{value ? (
							<Badge color="primary" className="text-[12px] dark">
								{options.find((language) => language.value === value)?.label}
							</Badge>
						) : (
							placeholder
						)}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[400px] bg-[#010B0F] text-white p-0 font-inter">
					<Command>
						<CommandInput placeholder={placeholder} className="dark" />
						<CommandList>
							<CommandEmpty>No option found</CommandEmpty>
							<CommandGroup>
								{options?.map((opt) => (
									<CommandItem
										value={opt.label}
										key={opt.value}
										onSelect={() => {
											setValue && setValue(opt.value);
											onClose();
										}}>
										<CheckIcon className={cn("mr-2 h-4 w-4", opt.value === value ? "opacity-100" : "opacity-0")} />
										{opt.label}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{helperText && <p className="text-xs text-gray-500">{helperText}</p>}
		</div>
	);
};

export default AppCombobox;
