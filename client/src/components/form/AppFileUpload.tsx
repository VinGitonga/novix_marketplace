import { ChangeEvent, RefObject } from "react";
import { Button } from "../ui/button";
import { LoaderCircleIcon } from "lucide-react";

type CommonProps = {
	label: string;
	helperText?: string;
	inputRef: RefObject<HTMLInputElement | null>;
	onValueChange?: (e: ChangeEvent<HTMLInputElement>) => void;
	accept?: string;
	loading?: boolean;
    selectedFile?: File
};

type AppFileUploadProps = CommonProps;

const AppFileUpload = ({ label, helperText, inputRef, onValueChange, accept, loading, selectedFile }: AppFileUploadProps) => {
	return (
		<div className="space-y-2">
			<Button
				variant="outline"
				className="dark w-full"
				disabled={loading}
				onClick={() => {
					inputRef.current?.click();
				}}>
				{loading && <LoaderCircleIcon className="w-5 h-5 animate-spin mr-2" />}
				{selectedFile ? selectedFile?.name : label}
			</Button>
			<input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onValueChange} />
			{helperText && <p className="text-xs text-gray-500">{helperText}</p>}
		</div>
	);
};

export default AppFileUpload;
