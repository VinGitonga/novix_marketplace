import makeAnimated from "react-select/animated";
import { components, ClearIndicatorProps, GroupBase } from "react-select";
import { XIcon } from "lucide-react";
import { Control, Controller, FieldError, FieldErrorsImpl, Merge } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { useState } from "react";
import clsx from "clsx";
import { IOption } from "@/types/Option";

const ClearIndicator = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
	props: ClearIndicatorProps<Option, IsMulti, Group>
) => {
	return (
		<components.ClearIndicator {...props}>
			<XIcon className="w-5 h-5" />
		</components.ClearIndicator>
	);
};

const animatedComponents = makeAnimated({
	DropdownIndicator: undefined,
	ClearIndicator,
});

const controlStyles = {
	base: "border rounded-lg bg-sidebar hover:cursor-pointer",
	focus: "border-gray-800 ring-1 ring-gray-700",
	nonFocus: "border-gray-300 hover:border-gray-400",
};

const placeholderStyles = "text-gray-500 pl-1 py-0.5";
const selectInputStyles = "pl-1 py-0.5";
const valueContainerStyles = "p-1 gap-1";
const singleValueStyles = "leading-7 ml-1";
const multiValueStyles = "bg-gray-700 rounded items-center py-0.5 pl-2 pr-1 gap-1.5";
const multiValueLabelStyles = "leading-6 py-0.5";
const multiValueRemoveStyles = "border border-gray-200 bg-sidebar hover:bg-red-50 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md";
const indicatorsContainerStyles = "p-1 gap-1";
const clearIndicatorStyles = "text-gray-500 p-1 rounded-md hover:bg-red-50 hover:text-red-800";
const indicatorSeparatorStyles = "bg-gray-300";
const dropdownIndicatorStyles = "p-1 hover:bg-gray-700 text-gray-500 rounded-md hover:text-black";
const menuStyles = "p-1 mt-2 border border-gray-200 bg-sidebar rounded-lg";
const groupHeadingStyles = "ml-3 mt-2 mb-1 text-gray-500 text-sm";
const optionStyles = {
	base: "hover:cursor-pointer px-3 py-2 rounded",
	focus: "bg-gray-700 active:bg-gray-800",
	selected: "after:content-['✔'] after:ml-2 after:text-green-500 text-gray-500",
};
const noOptionsMessageStyles = "text-gray-300 p-2 bg-gray-600 border border-dashed border-gray-200 rounded-sm";
const containerStyles = "bg-sidebar rounded-lg border border-gray-200 z-50";

interface AppCreateableSelectProps {
	name?: string;
	label: string;
	value?: any;
	setValue?: (value: unknown) => void;
	onChange?: (value: unknown) => void;
	control?: Control<any>;
	error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | Merge<FieldError, FieldError[]>;
	placeholder?: string;
	helperText?: string;
	options?: IOption[] | string[];
	onCreate?: (inputValue: string) => void;
	isMulti?: boolean;
	menuIsOpen?: boolean | undefined;
}

const AppCreateableSelect = ({
	name,
	label,
	value,
	setValue,
	onChange,
	control,
	error,
	placeholder = "Type something and press enter...",
	helperText,
	options,
	onCreate,
	isMulti = true,
	menuIsOpen = true,
}: AppCreateableSelectProps) => {
	const [inputValue, setInputValue] = useState<string>("");

	return control ? (
		<div className="flex flex-col">
			<p className="text-sm mb-2">{label}</p>
			<Controller
				control={control}
				name={name!}
				render={({ field: { onChange: onControlledChange, value: changedValue } }) => (
					<CreatableSelect
						components={animatedComponents}
						inputValue={inputValue}
						isClearable
						isMulti={isMulti}
						// menuIsOpen={menuIsOpen}
						value={changedValue}
						onChange={(val) => {
							onControlledChange(val);
						}}
						onInputChange={(val) => setInputValue(val)}
						placeholder={placeholder}
						options={options}
						onCreateOption={onCreate}
						onKeyDown={(e) => {
							if (!inputValue) return;
							switch (e.key) {
								case "Enter":
									onControlledChange([...(changedValue ?? []), { label: inputValue, value: inputValue }]);
									setInputValue("");
									e.preventDefault();
									break;
								case "Tab":
									onControlledChange([...(changedValue ?? []), { label: inputValue, value: inputValue }]);
									setInputValue("");
									e.preventDefault();
									break;
								default:
									break;
							}
						}}
						unstyled
						styles={{
							input: (base) => ({
								...base,
								"input:focus": {
									boxShadow: "none !important",
								},
							}),
							// On mobile, the label will truncate automatically, so we want to
							// override that behaviour.
							multiValueLabel: (base) => ({
								...base,
								whiteSpace: "normal",
								overflow: "visible",
							}),
							control: (base) => ({
								...base,
								transition: "none",
							}),
						}}
						classNames={{
							control: ({ isFocused }) => clsx(isFocused ? controlStyles.focus : controlStyles.nonFocus, controlStyles.base, !isFocused && "z-0"),
							placeholder: () => placeholderStyles,
							input: () => selectInputStyles,
							valueContainer: () => valueContainerStyles,
							singleValue: () => singleValueStyles,
							multiValue: () => multiValueStyles,
							multiValueLabel: () => multiValueLabelStyles,
							multiValueRemove: () => multiValueRemoveStyles,
							indicatorsContainer: () => indicatorsContainerStyles,
							clearIndicator: () => clearIndicatorStyles,
							indicatorSeparator: () => indicatorSeparatorStyles,
							dropdownIndicator: () => dropdownIndicatorStyles,
							menu: () => menuStyles,
							groupHeading: () => groupHeadingStyles,
							option: ({ isFocused, isSelected }) => clsx(isFocused && optionStyles.focus, isSelected && optionStyles.selected, optionStyles.base),
							noOptionsMessage: () => noOptionsMessageStyles,
							container: (state) => clsx(containerStyles, !state.isFocused && "z-0"),
						}}
					/>
				)}
			/>
			{helperText && <p className="text-xs text-gray-500">{helperText}</p>}
			{error && <p className="text-xs text-red-500">{error?.message as string}</p>}
		</div>
	) : (
		<div className="flex flex-col w-full gap-y-2">
			<p className="text-sm mb-2">{label}</p>
			<CreatableSelect
				components={animatedComponents}
				inputValue={inputValue}
				isClearable
				isMulti={isMulti}
				// menuIsOpen={menuIsOpen}
				value={value}
				onInputChange={(val) => setInputValue(val)}
				placeholder={placeholder}
				onChange={(val: any) => {
					setValue && setValue(val);
					onChange && onChange(val);
				}}
				options={options}
				onCreateOption={onCreate}
				onKeyDown={(e) => {
					if (!inputValue) return;
					switch (e.key) {
						case "Enter":
							onChange && onChange([...(value ?? []), { label: inputValue, value: inputValue }]);
							setValue && setValue([...(value ?? []), { label: inputValue, value: inputValue }]);
							setInputValue("");
							e.preventDefault();
							break;
						case "Tab":
							onChange && onChange([...(value ?? []), { label: inputValue, value: inputValue }]);
							setValue && setValue([...(value ?? []), { label: inputValue, value: inputValue }]);
							setInputValue("");
							e.preventDefault();
							break;
						default:
							break;
					}
				}}
				unstyled
				styles={{
					input: (base) => ({
						...base,
						"input:focus": {
							boxShadow: "none !important",
						},
					}),
					// On mobile, the label will truncate automatically, so we want to
					// override that behaviour.
					multiValueLabel: (base) => ({
						...base,
						whiteSpace: "normal",
						overflow: "visible",
					}),
					control: (base) => ({
						...base,
						transition: "none",
					}),
				}}
				classNames={{
					control: ({ isFocused }) => clsx(isFocused ? controlStyles.focus : controlStyles.nonFocus, controlStyles.base, !isFocused && "z-0"),
					placeholder: () => placeholderStyles,
					input: () => selectInputStyles,
					valueContainer: () => valueContainerStyles,
					singleValue: () => singleValueStyles,
					multiValue: () => multiValueStyles,
					multiValueLabel: () => multiValueLabelStyles,
					multiValueRemove: () => multiValueRemoveStyles,
					indicatorsContainer: () => indicatorsContainerStyles,
					clearIndicator: () => clearIndicatorStyles,
					indicatorSeparator: () => indicatorSeparatorStyles,
					dropdownIndicator: () => dropdownIndicatorStyles,
					menu: () => menuStyles,
					groupHeading: () => groupHeadingStyles,
					option: ({ isFocused, isSelected }) => clsx(isFocused && optionStyles.focus, isSelected && optionStyles.selected, optionStyles.base),
					noOptionsMessage: () => noOptionsMessageStyles,
					container: (state) => clsx(containerStyles, !state.isFocused && "z-0"),
				}}
			/>
			{helperText && <p className="text-xs text-gray-500">{helperText}</p>}
		</div>
	);
};

export default AppCreateableSelect;
