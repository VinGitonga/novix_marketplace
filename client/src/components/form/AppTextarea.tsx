"use client";
import { Control } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Label } from "../ui/label";

interface AppTextareaProps {
	label?: string;
	value?: string;
	setValue?: (val: string) => void;
	placeholder?: string;
	name?: string;
	control?: Control<any>;
	disabled?: boolean;
	helperText?: string;
}

const AppTextarea = ({ label, value, setValue, placeholder, name, control, disabled = false, helperText }: AppTextareaProps) => {
	return control ? (
		<FormField
			name={name!}
			control={control}
			render={({ field }) => (
				<FormItem>
					{label && <FormLabel className="font-inter">{label}</FormLabel>}
					<FormControl>
						<Textarea {...field} placeholder={placeholder} disabled={disabled} />
					</FormControl>
					{helperText && <FormDescription>{helperText}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	) : (
		<div className="flex flex-col items-start gap-3">
			{label && <Label className="font-inter">{label}</Label>}
			<Textarea
				placeholder={placeholder}
				value={value}
				className="dark"
				onChange={(e) => {
					setValue && setValue(e.target.value);
				}}
			/>
		</div>
	);
};

export default AppTextarea;
