import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "../ui/label";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

type CommonProps = {
	label?: string;
	placeholder?: string;
	dateFormat?: string;
	triggerWidth?: string;
};

interface UnControlledProps extends CommonProps {
	value?: Date;
	setValue?: (val: Date) => void;
}

interface ControlledProps extends CommonProps {
	name: string;
	control: Control<any>;
}

type AppDatePickerProps = UnControlledProps | ControlledProps;

// function AppDatePicker({ label, value, setValue, placeholder = "Pick a Date", dateFormat = "PPP", triggerWidth }: AppDatePickerProps) {
function AppDatePicker(props: AppDatePickerProps) {
	const { label, placeholder = "Pick a Date", dateFormat = "PPP", triggerWidth } = props;

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
						<Popover>
							<PopoverTrigger asChild>
								<Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal dark font-inter", !field?.value && "text-muted-foreground", triggerWidth)}>
									<CalendarIcon />
									{field?.value ? format(new Date(field?.value), dateFormat) : <span>{placeholder}</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0 dark" align="start">
								<Calendar
									mode="single"
									selected={field?.value}
									onSelect={(val) => {
										field?.onChange(val!);
									}}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	}

	const { value, setValue } = props;

	return (
		<div className="flex flex-col gap-3">
			{label && <Label>{label}</Label>}
			<Popover>
				<PopoverTrigger asChild>
					<Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal dark font-inter", !value && "text-muted-foreground", triggerWidth)}>
						<CalendarIcon />
						{value ? format(new Date(value), dateFormat) : <span>{placeholder}</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0 dark" align="start">
					<Calendar
						mode="single"
						selected={value}
						onSelect={(val) => {
							setValue && setValue(val!);
						}}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default AppDatePicker;
