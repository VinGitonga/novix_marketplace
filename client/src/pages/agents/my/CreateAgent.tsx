import AppInput from "@/components/form/AppInput";
import AppTextarea from "@/components/form/AppTextarea";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const CreateAgent = () => {
	return (
		<>
			<Helmet>
				<title>Create Agent - Novix</title>
			</Helmet>
			<div className="space-y-2 mt-3">
				<h1 className="text-lg font-semibold">Create a New AI Agent</h1>
				<p className="text-gray-300 text-sm">This page allows you to create and configure a new AI agent tailored to your needs.</p>
			</div>
			<div className="space-y-4 mt-5">
				<AppInput label="Name" placeholder="e.g. Eliza" />
				<AppInput label="Username" placeholder="@eliza" />
				<AppTextarea label="Summary" placeholder="Summary of what the agent is all about" />
				<AppTextarea label="Prompt" placeholder="System prompt defining agent behavior" />
				<AppInput label="Bio" placeholder="Bio data for this agent" helperText="Press enter to add" />
				<AppInput label="Topics" placeholder="Topics this agent should talk about" helperText="Press enter to add" />
				<div className="mt-10">
					<Button className="w-full">Save</Button>
				</div>
			</div>
		</>
	);
};

export default CreateAgent;
