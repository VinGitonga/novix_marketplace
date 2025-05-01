import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ELIZA_BACKEND_API_URL, ELIZA_BASE_URL } from "@/env";
import { useAuthStore } from "@/hooks/store/useAuthStore";
import useAgentsUtils from "@/hooks/useAgentsUtils";
import { swrFetcher } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { IAgent } from "@/types/Agent";
import { IApiEndpoint } from "@/types/Api";
import axios from "axios";
import { Loader2, PlayIcon } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { GoArrowUp } from "react-icons/go";
import { TbPencilDiscount } from "react-icons/tb";
import { Img } from "react-image";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import useSWR from "swr";

interface Agent {
	name: string;
	description: string;
	price: string;
	accuracy: string;
	backgroundImage: string;
}

const agents: Agent[] = [
	{
		name: "ChatBotPro",
		description: "Automates customer support with natural conversations.",
		price: "0.15 ETH",
		accuracy: "95%",
		backgroundImage: "/images/bg/card-bg-4.png",
	},
	{
		name: "SentimentAnalysisBots",
		description: "Analyzes text to determine positive, negative, or neutral sentiment.",
		price: "0.1 ETH",
		accuracy: "95%",
		backgroundImage: "/images/bg/card-bg-5.png",
	},
	{
		name: "ImageGenAI",
		description: "Generate high-quality images from text prompts.",
		price: "0.2 ETH",
		accuracy: "Free Trial Available",
		backgroundImage: "/images/bg/card-bg-6.png",
	},
];

interface Message {
	id: string;
	type: string;
	createdAt: number;
	content: {
		text: string;
		source: string;
	};
	entityId: string;
	agentId: string;
	roomId: string;
	unique: boolean;
	metadata: {
		entityName?: string;
	};
}

interface UserMessage extends Message {
	content: {
		text: string;
		source: "client_chat:user";
	};
	metadata: {
		entityName: "user";
	};
}

interface AgentMessage extends Message {
	content: {
		text: string;
		source: "client_chat:agent";
		actions?: string[];
		thought?: string;
		inReplyTo?: string;
		channelType?: string;
	};
	metadata: {};
}

type CombinedMessage = UserMessage | AgentMessage;

type SendMsgResp = {
	success: boolean;
	data: {
		message: {
			text: string;
			thought: string;
			plan: string;
			actions: string[];
			source: string;
			inReplyTo: string;
		};
		messageId: string;
		name: string;
		roomId: string;
	};
};
const maxCharacters = 2000;

const Playground = () => {
	const params = useParams();
	const [input, setInput] = useState<string>("");
	const [isStarting, setIsStarting] = useState<boolean>(false);
	const [messages, setMessages] = useState<{ createdAt: number; text: string; source: string }[]>([]);

	const { account } = useAuthStore();
	const { updateCreditsForUser } = useAgentsUtils();
	const { startElizaAgent } = useAgentsUtils();
	const [loading, setLoading] = useState<boolean>(false);

	const { data: agentDetails, isLoading } = useSWR<IAgent>(!params.agentId ? undefined : [`${IApiEndpoint.AGENTS_GET_DETAILS}/${params.agentId}`], swrFetcher, { keepPreviousData: true });
	const { data: status, mutate } = useSWR(!agentDetails ? undefined : [`${IApiEndpoint.AGENTS_GET_ELIZA_STATUS}/${agentDetails.elizaId}`], swrFetcher, { keepPreviousData: true });
	const { data: creditsData, mutate: mutateCredits } = useSWR<{ _id: string; count: number }>(!account ? null : [`${IApiEndpoint.AGENTS_GET_AGENT_CREDITS}/${account?.accountId}/${agentDetails?._id}`], swrFetcher, {
		keepPreviousData: true,
	});

	const onClickStartElizaAgent = async () => {
		setIsStarting(true);
		try {
			const resp = await startElizaAgent(agentDetails?.elizaId!);
			if (resp?.status === "success") {
				toast.success("Agent Started Successfully");
				mutate();
			} else {
				toast.error("Unable to start the agent");
			}
		} catch (err) {
			toast.error("Unable to start the agent");
		} finally {
			setIsStarting(false);
		}
	};

	const sendMsg = async () => {
		if (!input.trim() || input.length > maxCharacters) {
			return;
		}

		const roomId = account?.entityId;
		const agentId = agentDetails?.elizaId;

		const body = {
			senderId: account?._id,
			roomId: roomId,
			text: input,
			source: "client_chat:user",
			user: "user",
			entityId: agentId,
		};

		setLoading(true);
		setMessages((prev) => [...prev, { createdAt: Date.now(), text: input, source: "client_chat:user" }]);
		setInput("");
		try {
			const rawResp = await axios.post<SendMsgResp>(`${ELIZA_BASE_URL}/agents/${agentId}/message`, body);

			const resp = rawResp.data;
			if (resp.success) {
				setMessages((prev) => [
					...prev,
					{
						createdAt: Date.now(),
						text: resp.data.message.text,
						source: "client_chat:agent",
					},
				]);
				updateCredits();
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const updateCredits = async () => {
		try {
			await updateCreditsForUser(account?.accountId!, agentDetails?._id!, agentDetails?.owner!);
			mutateCredits();
		} catch (err) {}
	};

	const getMemories = async () => {
		if (!agentDetails) return;
		const agentId = agentDetails?.elizaId;
		const roomId = account?.entityId;

		try {
			const rawResp = await axios<{ success: boolean; data: { memories: CombinedMessage[] } }>(`${ELIZA_BASE_URL}/agents/${agentId}/rooms/${roomId}/memories`);
			// const rawResp = await axios<{ success: boolean; data: { memories: CombinedMessage[] } }>(`${ELIZA_BASE_URL}/agents/${agentId}`);

			const resp = rawResp.data;

			if (resp?.success) {
				const memories = resp?.data?.memories;

				const initMessages = memories.map((item) => ({ createdAt: item.createdAt, text: item.content.text, source: item.content.source })).sort((a, b) => b.createdAt - a.createdAt);

				setMessages(initMessages);
			} else {
				console.error("Failed to fetch memories");
			}
		} catch (err) {
			console.error("error:mem", err);
		}
	};

	const getRoomDetails = async () => {
		if (!account || !agentDetails) {
			return;
		}

		const roomId = account?.entityId;

		try {
			// const rawResp = await axios.get<{ success: boolean; data: { id: string; name: string; source: string; worldId: string; entities: { id: string; name: string }[] } }>(
			// 	`${ELIZA_BASE_URL}/agents/${agentDetails?.elizaId}/rooms`
			// );
			const rawResp = await axios.get<{ success: boolean; data: { id: string; name: string; source: string; worldId: string; entities: { id: string; name: string }[] } }>(
				`${ELIZA_BACKEND_API_URL}/agents/rooms/${agentDetails?.elizaId}`
			);

			const resp = rawResp.data;

			console.log("resp", resp);
		} catch (err) {
			// createRoom()
		}
	};

	const createRoom = async () => {
		const info = {
			name: `${account?.name}-${agentDetails?.name}`,
			entityId: agentDetails?.elizaId,
			roomId: account?.entityId,
			worldId: "b102d90e-8be1-4d00-8cb1-edd54b6e1cb2",
		};
		const agentId = agentDetails?.elizaId;
		try {
			// const rawResp = await axios.post<{ success: boolean; data: { id: string; name: string; source: string; worldId: string; entities: { id: string; name: string }[] } }>(
			// 	`${ELIZA_BASE_URL}/agents/${agentId}/rooms`,
			// 	info
			// );
			const rawResp = await axios.post<{ success: boolean; data: { id: string; name: string; source: string; worldId: string; entities: { id: string; name: string }[] } }>(
				`${ELIZA_BACKEND_API_URL}/agents/rooms/create/${agentId}`,
				info
			);

			const resp = rawResp.data;

			console.log("resp:create", resp);
		} catch (err) {}
	};

	useEffect(() => {
		getMemories();
		// getRoomDetails();
	}, [agentDetails, account]);

	return (
		<div>
			<title>Playground - Novix</title>
			<div className="flex items-center justify-center mt-10">
				<div className="space-y-5">
					<div className="">
						<div className="bg-gray-800 shadow-md px-2 py-1 rounded-2xl text-sm flex items-center gap-2">
							<Img src={"/images/icons/caret.png"} className="w-5 h-5" />
							<span>Finance</span>
						</div>
					</div>
					<p className="text-center">Credits: {creditsData && creditsData?.count}</p>
				</div>
			</div>
			{(isLoading || !agentDetails) && (
				<div className="mt-16 *:w-full md:w-4/5 mx-auto">
					<SkeletonCard />
				</div>
			)}
			{agentDetails && (
				<>
					<div className="px-3 md:px-20 flex flex-col items-center justify-center mt-10 space-y-5">
						<div className="p-2 rounded-full border border-white/90 relative">
							<Img src={"https://api.dicebear.com/9.x/adventurer/svg?seed=jacky"} className="w-10 h-10" />
							<div className="absolute bottom-1 right-0">
								<div className={cn("p-1.5 rounded-full", status === "active" ? "bg-green-500" : "bg-gray-400")}></div>
							</div>
						</div>
						<h1 className="text-4xl font-bold">{agentDetails?.name}</h1>
						{status !== "active" && (
							<Button size={"icon"} onClick={onClickStartElizaAgent} disabled={isStarting}>
								{isStarting ? <Loader2 className="animate-spin" /> : <PlayIcon />}
							</Button>
						)}
						<p className="text-white/80">{agentDetails?.summary}</p>
					</div>
					<div className="mt-10 *:w-full md:w-4/5 mx-auto">
						<div className="bg-white/5 py-6 px-8 rounded-2xl border border-white/20 shadow-lg focus:border-2 focus-white transition duration-200 ease-in-out">
							<div className="space-y-4">
								{messages.map((msg, index) => (
									<div key={index} className={`flex ${msg.source === "client_chat:user" ? "justify-end" : "justify-start"}`}>
										<div className="bg-gray-700/80 p-4 rounded-xl max-w-[80%]">
											<p className="text-white/80">{msg.text}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="mt-16 *:w-full md:w-4/5 mx-auto">
						<div className="bg-white/5 py-6 px-8 rounded-2xl border border-white/20 shadow-lg focus:border-2 focus:border-white transition duration-200 ease-in-out">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										if (!loading) {
											sendMsg();
										}
									}
								}}
								disabled={status !== "active"}
								placeholder="A chat AI agent that can allow me communicate with multiple people..."
								className="w-full bg-transparent text-white/80 placeholder:text-[#949494]/50 text-sm focus:outline-none transition duration-200 ease-in-out"
							/>
							<div className="flex items-center justify-between mt-2">
								<div className="flex items-center gap-2">
									<Button size={"icon"} className="cursor-pointer bg-[#373737] hover:bg-gray-900">
										<TbPencilDiscount />
									</Button>
									<Badge className="bg-[#373737] py-2 px-2.5 rounded-3xl text-xs text-[#7C7C7C]">{`${input.length}/${maxCharacters} Characters`}</Badge>
								</div>
								<Button disabled={loading} onClick={sendMsg} size={"icon"} className="cursor-pointer bg-[#373737] hover:bg-gray-900">
									<GoArrowUp />
								</Button>
							</div>
						</div>
					</div>
				</>
			)}
			<div className="mt-6 py-3 flex items-center text-sm text-gray-800 before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6 dark:text-white dark:before:border-neutral-600 dark:after:border-neutral-600">
				Recommended Agents
			</div>
			<div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-x-7 gap-y-10 px-2">
				{agents.map((agent, index) => (
					<AgentDetailsCard key={index} agentData={agent} />
				))}
			</div>
		</div>
	);
};

const AgentDetailsCard: FC<{ agentData: Agent }> = ({ agentData }) => {
	return (
		<div style={{ backgroundImage: `url(${agentData.backgroundImage})` }} className="w-full bg-cover bg-center px-4 py-5 rounded-lg shadow-lg">
			<div className="space-y-8">
				<h2 className="font-inter text-lg font-bold">{agentData.name}</h2>
				<p className="font-inter">{agentData.description}</p>
				<div className="flex items-center gap-2">
					<button className="bg-transparent border border-white/20 text-white px-4 py-2 rounded-lg font-semibold shadow font-inter cursor-pointer hover:shadow-lg transition duration-200 ease-in-out flex items-center hover:bg-white/20">
						{agentData.price}
					</button>
					<p className="font-inter text-sm text-white/50">{agentData.accuracy}</p>
				</div>
			</div>
		</div>
	);
};

function SkeletonCard() {
	return (
		<div className="flex flex-col space-y-3">
			<Skeleton className="h-[125px] w-full rounded-xl" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-4/5" />
			</div>
		</div>
	);
}

export default Playground;
