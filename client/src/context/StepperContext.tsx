import { createContext, useContext } from "react";

export type StepStatus = "complete" | "active" | "incomplete";

export type StepOrientation = "horizontal" | "vertical";

export interface StepContext {
	status: StepStatus;
	count: number;
	current: number;
}

export const StepContext = createContext<StepContext>({
	status: "incomplete",
	count: 0,
	current: 0,
});

export const useStepContext = () => useContext(StepContext);
