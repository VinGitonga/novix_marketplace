import { ReactNode, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { StepStatus, StepContext, useStepContext } from "@/context/StepperContext";
import { cn } from "@/lib/utils";

interface IStep {
	title: string;
	description: string;
	completed: boolean;
	highlighted: boolean;
	selected: boolean;
	stepIcon: ReactNode;
}

export interface StepItem {
	title?: string;
	description?: string;
	stepIcon?: ReactNode;
}

interface IProps {
	steps: (StepItem | string)[]; // string is for backward compatibility
	index: number;
	orientation?: "horizontal" | "vertical";
	containerHeight?: string; // for vertical stepper
	showTextItems?: boolean; // for vertical stepper
	showVerticalDesc?: boolean;
}

interface HorizontalStepItemProps {
	title?: string;
	description?: string;
	selected?: boolean;
	highlighted?: boolean;
	completed?: boolean;
	itemIndex: number;
	icon?: ReactNode;
	showTextItems?: boolean;
	showVerticalDesc?: boolean;
}

interface VerticalStepItemProps extends HorizontalStepItemProps {
	containerHeight?: string;
	showTextItems?: boolean;
}
/**
 *
 * @param steps - array of steps. Each step can be a string or an object with title, description and stepIcon
 * @param index - current step index
 * @param orientation - horizontal or vertical
 * @param containerHeight - for vertical stepper only
 * @param showTextItems - for vertical stepper only
 * @returns JSX.Element
 *
 * @example
 *
 * const steps = [
 * { title: "Step 1", description: "Step 1 description", stepIcon: <Icon /> },
 * { title: "Step 2", description: "Step 2 description", stepIcon: <Icon /> },
 * { title: "Step 3", description: "Step 3 description", stepIcon: <Icon /> },
 * ]
 *
 * const {activeStep, setActiveStep} = useSteps({
 * initialStep: 0,
 * count: steps.length,
 * })
 *
 * <Stepper steps={steps} index={activeStep} orientation="horizontal" />
 *
 * <Stepper steps={steps} index={activeStep} orientation="vertical" containerHeight="h-[400px]" showTextItems={false} />
 *
 * @see `useSteps` hook in `src/hooks/useSteps.ts`
 *
 * @see `StepperContext` in `src/context/StepperContext.ts`
 *
 * - Make sure to use in a client side only component in nextjs due to React Server Components limitations
 */
const AppStepper = ({ steps, index, orientation = "horizontal", containerHeight = "300px", showTextItems = true, showVerticalDesc = true }: IProps) => {
	function getStatus(step: number): StepStatus {
		if (step < index) return "complete";
		if (step > index) return "incomplete";
		return "active";
	}

	const [newStep, setNewStep] = useState<Array<IStep>>([]);
	const stepsRef = useRef<Array<IStep>>(null);

	const updateStep = (step: number, steps: Array<any>) => {
		const myNewSteps = [...steps];
		let counter = 0;

		while (counter < myNewSteps.length) {
			if (counter === step) {
				myNewSteps[counter] = {
					...myNewSteps[counter],
					highlighted: true,
					selected: true,
					completed: true,
				};
				counter++;
			} else if (counter < step) {
				myNewSteps[counter] = {
					...myNewSteps[counter],
					highlighted: false,
					selected: true,
					completed: true,
				};
				counter++;
			} else {
				myNewSteps[counter] = {
					...myNewSteps[counter],
					highlighted: false,
					selected: false,
					completed: false,
				};
				counter++;
			}
		}
		return myNewSteps;
	};

	useEffect(() => {
		// create object
		const stepsState = steps.map((step, index) =>
			Object.assign(
				{},
				{
					title: typeof step === "string" ? step : step.title,
					description: typeof step === "string" ? "" : step.description,
					completed: false,
					highlighted: index === 0 ? true : false,
					selected: index === 0 ? true : false,
					stepIcon: typeof step === "string" ? null : step.stepIcon,
				}
			)
		);

        // @ts-expect-error
		stepsRef.current = stepsState;
		const newCurrent = updateStep(index, stepsRef.current!);
		setNewStep(newCurrent);
	}, [steps, index]);

	return (
		<StepContext.Provider
			value={{
				count: steps.length,
				current: index,
				status: getStatus(index),
			}}>
			{orientation === "horizontal" && (
				<div className="flex justify-between items-center mb-16 p-4 w-full">
					{newStep.map((item, index) => (
						<HorizontalStepper
							key={index}
							title={item.title}
							description={item.description}
							itemIndex={index}
							selected={item.selected}
							highlighted={item.highlighted}
							completed={item.completed}
							icon={item?.stepIcon}
							showTextItems={showTextItems}
						/>
					))}
				</div>
			)}
			{orientation === "vertical" && (
				<div className={`p-4 ${showTextItems ? "mr-16" : "mr-0"} ${containerHeight}`}>
					{newStep.map((item, index) => (
						<VerticalStepper
							key={index}
							title={item.title}
							description={item.description}
							itemIndex={index}
							selected={item.selected}
							highlighted={item.highlighted}
							completed={item.completed}
							containerHeight={containerHeight}
							showTextItems={showTextItems}
							icon={item?.stepIcon}
							showVerticalDesc={showVerticalDesc}
						/>
					))}
				</div>
			)}
		</StepContext.Provider>
	);
};

const HorizontalStepper = ({ title, description, itemIndex, selected, highlighted, completed, icon, showTextItems = true }: HorizontalStepItemProps) => {
	const { count } = useStepContext();

	return (
		<div className={`${itemIndex !== count - 1 ? "w-full" : ""} flex items-center`}>
			<div className="relative flex flex-col items-center text-teal-600">
				<div
					className={cn(
						"rounded-full transition duration-500 ease-in-out border-2 border-gray-300 h-8 w-8 flex items-center justify-center py-3",
						selected ? "bg-primary-600 text-white font-bold border-primary-600" : ""
					)}>
					{completed ? <Check className="w-4 h-4" /> : icon ? icon : <span className="text-xs text-gray-600">{itemIndex + 1}</span>}
				</div>
				{showTextItems && (
					<div className={cn("absolute top-0 text-center mt-12", highlighted ? "text-gray-900 dark:text-white" : "text-gray-400")}>
						<div className="flex flex-col items-center pt-3 space-y-2">
							<div className="text-[10px] font-medium uppercase">{title}</div>
							<div className="text-[9px] font-medium text-gray-700">{description}</div>
						</div>
					</div>
				)}
			</div>
			<div className={cn("w-full transition duration-500 ease-in-out h-[2px] mx-2", completed ? "bg-white" : "bg-gray-500")} />
		</div>
	);
};

const VerticalStepper = ({ title, description, itemIndex, selected, highlighted, completed, containerHeight, showTextItems, icon, showVerticalDesc }: VerticalStepItemProps) => {
	const { count } = useStepContext();
	return (
		<div className={`${itemIndex !== count - 1 ? `h-[200px]` : "h-full"} flex flex-col items-center`}>
			<div className="relative flex flex-row items-center text-primary-600">
				<div
					className={cn(
						"rounded-full transition duration-500 ease-in-out border-2 border-gray-300 h-8 w-8 flex items-center justify-center py-3 text-[10px]",
						selected ? "bg-primary-600 text-white font-bold border-primary-600" : ""
					)}>
					{completed ? <Check className="w-4 h-4" /> : icon ? icon : <span className="text-xs text-gray-600">{itemIndex + 1}</span>}
				</div>
				{showTextItems && (
					<div className={cn("absolute left-0 text-center ml-10", highlighted ? "text-gray-900 dark:text-white" : "text-gray-400")}>
						<div className="flex flex-col items-center pt-3 space-y-2">
							<div className="text-base font-medium uppercase">{title}</div>
							{showVerticalDesc && <div className="text-sm font-medium text-gray-700">{description}</div>}
						</div>
					</div>
				)}
			</div>
			<div className={cn("w-[2px] flex-auto border-t-2 transition duration-500 ease-in-out my-2", completed ? "bg-white" : "bg-gray-500", itemIndex === count - 1 ? "hidden" : "")}></div>
		</div>
	);
};

export default AppStepper;