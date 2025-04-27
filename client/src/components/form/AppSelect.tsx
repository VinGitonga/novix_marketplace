import { IOption } from "@/types/Option";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "@/lib/utils";

interface AppSelectProps {
	label?: string;
	value?: string;
	setValue?: (val: string) => void;
	options: IOption[];
	placeholder?: string;
	title?: string;
    onActionSelect?: (val?: string) => void;
	triggerClassName?: string
}

const AppSelect = ({ label, value, setValue, options, placeholder, title, onActionSelect, triggerClassName }: AppSelectProps) => {
	return (
		<div className="flex flex-col items-start gap-3 font-inter">
			{label && <Label>{label}</Label>}
			<Select
				value={value}
				onValueChange={(val) => {
					setValue && setValue(val);
                    onActionSelect && onActionSelect(val);
				}}>
				<SelectTrigger className={cn("w-[150px] lg:w-[450px] dark", triggerClassName)}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent className="dark">
					<SelectGroup>
						{title && <SelectLabel>{title}</SelectLabel>}
						{options.map((opt, idx) => (
							<SelectItem key={idx} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
};

export default AppSelect;
