import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface AppSwitchProps {
	label?: string;
	checked?: boolean;
	onChange?: (val: boolean) => void;
	orientation?: "horizontal" | "vertical";
}

const AppSwitch = ({ label, checked = false, onChange, orientation = "horizontal" }: AppSwitchProps) => {
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
