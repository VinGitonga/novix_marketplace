import AppCreateableSelect from "@/components/form/AppCreatableSelect";
import AppInput from "@/components/form/AppInput";
import AppTextarea from "@/components/form/AppTextarea";
import { Button } from "@/components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import useAgentsUtils from "@/hooks/useAgentsUtils";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
	name: z.string().min(1, "Name of the agent is required"),
	username: z.string(),
	summary: z.string().min(3, "Summary of the AI agent is required"),
	description: z.string().min(3, "Agent description is required"),
	prompt: z.string().min(10, "System Prompt for this Agent is required"),
	bio: z.array(z.object({ label: z.string(), value: z.string() })).min(1, "Add atleast one bio topic"),
	topics: z.array(z.object({ label: z.string(), value: z.string() })).min(1, "Add atleast one topic"),
});

const CreateAgent = () => {
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const { createAgent } = useAgentsUtils();

	const formMethods = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { name: "", username: "", summary: "", description: "", prompt: "", bio: [], topics: [] } });

	const {
		handleSubmit,
		control,
		reset,
		formState: { errors: formErrors },
	} = formMethods;

	const onSubmit = handleSubmit(async (data) => {
		const infoData = {
			name: data.name,
			username: data.username,
			summary: data.summary,
			description: data.description,
			prompt: data.prompt,
			bio: data.bio.map((item) => item.value),
			topics: data.topics.map((item) => item.value),
		};
		setIsSaving(true);
		try {
			const resp = await createAgent(infoData);

			console.log("resp", resp);
		} catch (err) {
			console.log("err", err);
		} finally {
			setIsSaving(false);
		}
	});
	return (
		<>
			<title>Create Agent - Novix</title>
			<div className="space-y-2 mt-3">
				<h1 className="text-lg font-semibold">Create a New AI Agent</h1>
				<p className="text-gray-300 text-sm">This page allows you to create and configure a new AI agent tailored to your needs.</p>
			</div>
			<FormProvider {...formMethods}>
				<form onSubmit={onSubmit}>
					<div className="space-y-4 mt-5">
						<AppInput label="Name" placeholder="e.g. Eliza" name="name" control={control} />
						<AppInput label="Username" placeholder="@eliza" name="username" control={control} />
						<AppTextarea label="Summary" placeholder="Summary of what the agent is all about" name="summary" control={control} />
						<AppTextarea label="Prompt" placeholder="System prompt defining agent behavior" name="prompt" control={control} />
						<AppTextarea label="Description" placeholder="Everything about this Agent" name="description" control={control} />
						{/* <AppInput label="Bio" placeholder="Bio data for this agent" helperText="Press enter to add" name="bio" control={control} /> */}
						<AppCreateableSelect label="Bio" placeholder="Bio Data Test" helperText="Press enter to add" name="bio" control={control} error={formErrors.bio as any} />
						<AppCreateableSelect label="Topics" placeholder="Topics this agent should talk about" helperText="Press enter to add" name="topics" control={control} error={formErrors.topics as any} />
						<div className="mt-10">
							<Button className="w-full cursor-pointer" type="submit" disabled={isSaving}>
								{isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
								{isSaving ? "Saving ..." : "Save"}
							</Button>
						</div>
					</div>
				</form>
			</FormProvider>
		</>
	);
};

export default CreateAgent;
