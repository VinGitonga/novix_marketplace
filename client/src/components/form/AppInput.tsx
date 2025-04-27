import { Control } from "react-hook-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface AppInputProps {
	label?: string;
	value?: string;
	setValue?: (val: string) => void;
	placeholder?: string;
	name?: string;
	control?: Control<any>;
	type?: string;
	disabled?: boolean;
	helperText?: string;
}

const AppInput = ({ label, value, setValue, placeholder, name, control, type = "text", disabled = false, helperText }: AppInputProps) => {
	return control ? (
		<FormField
			name={name!}
			control={control}
			render={({ field }) => (
				<FormItem>
					{label && <FormLabel className="font-inter">{label}</FormLabel>}
					<FormControl>
						<Input {...field} placeholder={placeholder} type={type} disabled={disabled} />
					</FormControl>
					{helperText && <FormDescription>{helperText}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	) : (
		<div className="flex flex-col items-start gap-3">
			{label && <Label className="font-inter">{label}</Label>}
			<Input
				placeholder={placeholder}
				value={value}
				className="dark"
				onChange={(e) => {
					setValue && setValue(e.target.value);
				}}
			/>
			{helperText && <p className="text-sm text-gray-600">{helperText}</p>}
		</div>
	);
};

export default AppInput;
