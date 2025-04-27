import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "../ui/label";

interface AppDatePickerProps {
	label?: string;
	value?: Date;
	setValue?: (val: Date) => void;
	placeholder?: string;
	dateFormat?: string;
}

function AppDatePicker({ label, value, setValue, placeholder = "Pick a Date", dateFormat = "PPP" }: AppDatePickerProps) {
	return (
		<div className="flex flex-col gap-3">
			{label && <Label>{label}</Label>}
			<Popover>
				<PopoverTrigger asChild>
					<Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal dark font-inter", !value && "text-muted-foreground")}>
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
