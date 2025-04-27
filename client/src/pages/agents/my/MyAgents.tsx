import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, SettingsIcon } from "lucide-react";
import { Img } from "react-image";
import { RiSparklingLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { VscDebugStart } from "react-icons/vsc";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { IAgent } from "@/types/Agent";
import useSWR from "swr";
import { IApiEndpoint } from "@/types/Api";
import { swrFetcher } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import useAgentsUtils from "@/hooks/useAgentsUtils";
import { useState } from "react";
import { toast } from "sonner";

interface AgentItem {
	name: string;
	username: string;
	summary: string;
	status: "active" | "inactive";
}

interface AgentItemProps {
	item: IAgent;
}

const MyAgents = () => {
	const { data: loadedAgents, isLoading } = useSWR<IAgent[]>([IApiEndpoint.AGENTS_GET_ALL], swrFetcher, { keepPreviousData: true });
	return (
		<>
			<title>My Agents - Novix</title>
			<div className="space-y-2 mt-3 mb-5">
				<h1 className="text-lg font-semibold">My Agents</h1>
				<p className="text-gray-300 text-sm">This page allows you to create and configure a new AI agent tailored to your needs.</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
				{isLoading && [...Array.from({ length: 5 })].map((_, idx) => <SkeletonCard key={idx} />)}
				{loadedAgents && loadedAgents?.length > 0 && (
					<TooltipProvider>
						{loadedAgents.map((item, idx) => (
							<AgentItem item={item} key={idx} />
						))}
					</TooltipProvider>
				)}
			</div>
		</>
	);
};

const AgentItem = ({ item }: AgentItemProps) => {
	const [isStarting, setIsStarting] = useState<boolean>(false);
	const { startElizaAgent } = useAgentsUtils();
	const navigate = useNavigate();
	const { data: status, mutate } = useSWR([`${IApiEndpoint.AGENTS_GET_ELIZA_STATUS}/${item.elizaId}`], swrFetcher, { keepPreviousData: true });

	const onClickStartElizaAgent = async () => {
		setIsStarting(true);
		try {
			const resp = await startElizaAgent(item.elizaId);
			if (resp?.status === "success") {
				toast.success("Agent Started Successfully");
				mutate()
			} else {
				toast.error("Unable to start the agent");
			}
		} catch (err) {
			toast.error("Unable to start the agent");
		} finally {
			setIsStarting(false);
		}
	};

	const onClickMessage = async () => {
		navigate(`/app/agents/playground/${item._id}`);
	};
	return (
		<div className="bg-white/5 px-8 py-7 shadow-xl rounded-3xl">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-full border border-white/90 relative">
						<Img src={"https://api.dicebear.com/9.x/adventurer/svg?seed=jacky"} className="w-10 h-10" />
						<div className="absolute bottom-1 right-0">
							<div className={cn("p-1.5 rounded-full", status === "active" ? "bg-green-500" : "bg-gray-400")}></div>
						</div>
					</div>
					<div className="space-y-2">
						<h1 className="text-sm">{item.name}</h1>
						<p className="text-xs">{item.username}</p>
					</div>
				</div>
			</div>
			<div className="mt-3 space-y-4">
				<p className="text-sm">{item.summary}</p>
			</div>
			<Separator className="mt-2" />
			<div className="flex items-center justify-between mt-2">
				<Button className="rounded-2xl" size={"sm"} disabled={isStarting} onClick={() => (status === "active" ? onClickMessage() : onClickStartElizaAgent())}>
					{status === "active" ? <RiSparklingLine className="mr-1 w-5 h-5" /> : isStarting ? <Loader2 className="mr-1 w-5 h-5 animate-spin" /> : <VscDebugStart className="mr-1 w-5 h-5" />}
					{status === "active" ? "Message" : "Start"}
				</Button>
				<Tooltip>
					<TooltipTrigger>
						<Button className="dark" size={"icon"}>
							<SettingsIcon />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Configure</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
};

function SkeletonCard() {
	return (
		<div className="flex flex-col space-y-3">
			<Skeleton className="h-[125px] w-[250px] rounded-xl" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-[250px]" />
				<Skeleton className="h-4 w-[200px]" />
			</div>
		</div>
	);
}

export default MyAgents;
