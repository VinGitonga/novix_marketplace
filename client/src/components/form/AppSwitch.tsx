import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "../ui/form";

type CommonProps = {
	label?: string;
	orientation?: "horizontal" | "vertical";
};

interface UnControlledProps extends CommonProps {
	checked?: boolean;
	onChange?: (val: boolean) => void;
}

interface ControlledProps extends CommonProps {
	name: string;
	control: Control<any>;
}
type AppSwitchProps = UnControlledProps | ControlledProps;

// const AppSwitch = ({ label, checked = false, onChange, orientation = "horizontal" }: AppSwitchProps) => {
const AppSwitch = (props: AppSwitchProps) => {
	const { label, orientation = "horizontal" } = props;

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
						{orientation === "horizontal" ? (
							<div className="flex items-center space-x-2">
								<Switch className="dark" checked={field.value} onCheckedChange={field.onChange} />
								{label && <Label className="font-inter">{label}</Label>}
							</div>
						) : (
							<div className="flex flex-col gap-2">
								{label && <Label className="font-inter">{label}</Label>}
								<Switch className="dark" checked={field.value} onCheckedChange={field.onChange} />
							</div>
						)}
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	}

	const { checked, onChange } = props;
	return (
		<>
			{orientation === "horizontal" ? (
				<div className="flex items-center space-x-2">
					<Switch className="dark" checked={checked} onCheckedChange={onChange} />
					{label && <Label className="font-inter">{label}</Label>}
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{label && <Label className="font-inter">{label}</Label>}
					<Switch className="dark" checked={checked} onCheckedChange={onChange} />
				</div>
			)}
		</>
	);
};

export default AppSwitch;
