import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SettingsIcon } from "lucide-react";
import { Img } from "react-image";
import { RiSparklingLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { VscDebugStart } from "react-icons/vsc";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface AgentItem {
	name: string;
	username: string;
	summary: string;
	status: "active" | "inactive";
}

interface AgentItemProps {
	item: AgentItem;
}

const agents: AgentItem[] = [
	{
		name: "Jacky",
		username: "@jacky",
		summary: "Stay ahead with live updates and predictive analytics.",
		status: "active",
	},
	{
		name: "Hellen",
		username: "@hellen",
		summary: "Stay ahead with live updates and predictive analytics.",
		status: "inactive",
	},
	{
		name: "Eric",
		username: "@eric",
		summary: "Stay ahead with live updates and predictive analytics.",
		status: "active",
	},
	{
		name: "Alice",
		username: "@alice",
		summary: "Stay ahead with live updates and predictive analytics.",
		status: "inactive",
	},
	{
		name: "Bob",
		username: "@bob",
		summary: "Stay ahead with live updates and predictive analytics.",
		status: "active",
	},
];

const MyAgents = () => {
	return (
		<>
			<title>My Agents - Novix</title>
			<div className="space-y-2 mt-3 mb-5">
				<h1 className="text-lg font-semibold">My Agents</h1>
				<p className="text-gray-300 text-sm">This page allows you to create and configure a new AI agent tailored to your needs.</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
				<TooltipProvider>
					{agents.map((item, idx) => (
						<AgentItem item={item} key={idx} />
					))}
				</TooltipProvider>
			</div>
		</>
	);
};

const AgentItem = ({ item }: AgentItemProps) => {
	const navigate = useNavigate()
	return (
		<div className="bg-white/5 px-8 py-7 shadow-xl rounded-3xl">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-full border border-white/90 relative">
						<Img src={"https://api.dicebear.com/9.x/adventurer/svg?seed=jacky"} className="w-10 h-10" />
						<div className="absolute bottom-1 right-0">
							<div className={cn("p-1.5 rounded-full", item.status === "active" ? "bg-green-500" : "bg-gray-400")}></div>
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
				<Button className="rounded-2xl" size={"sm"} onClick={() => navigate("/app/agents/playground")}>
					{item.status === "active" ? <RiSparklingLine className="mr-1" /> : <VscDebugStart className="mr-1" />}
					{item.status === "active" ? "Message" : "Start"}
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

export default MyAgents;
