import { IOption } from "@/types/Option";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface AppRadioGroupProps {
	label?: string;
	value?: string;
	setValue?: (val: string) => void;
	options: IOption[];
	onActionSelect?: (val?: string) => void;
	defaultValue?: string;
}

const AppRadioGroup = ({ label, value, setValue, options, onActionSelect, defaultValue }: AppRadioGroupProps) => {
	return (
		<div className="flex flex-col items-start gap-3 font-inter">
			{label && <Label>{label}</Label>}
			<RadioGroup
				defaultValue={defaultValue}
				value={value}
				onValueChange={(val) => {
					setValue && setValue(val);
					onActionSelect && onActionSelect(val);
				}}>
				{options.map((opt, idx) => (
					<div className="flex items-center space-x-2" key={idx}>
						<RadioGroupItem className="dark" value={opt.value} id={`r-${opt.value}`} />
						<Label>{opt.label}</Label>
					</div>
				))}
			</RadioGroup>
		</div>
	);
};

export default AppRadioGroup;
