import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FC } from "react";
import { GoArrowUp } from "react-icons/go";
import { TbPencilDiscount } from "react-icons/tb";
import { Img } from "react-image";

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

const Playground = () => {
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
				</div>
			</div>
			<div className="px-3 md:px-20 flex flex-col items-center justify-center mt-10 space-y-5">
				<h1 className="text-4xl font-bold">Financial Research AI Agent</h1>
				<p className="text-white/80">Unlock deeper insights, streamline analysis, and make data-driven decisions faster with our cutting-</p>
			</div>
			<div className="mt-16 *:w-full md:w-4/5 mx-auto">
				<div className="bg-white/5 py-6 px-8 rounded-2xl border border-white/20 shadow-lg focus:border-2 focus:border-white transition duration-200 ease-in-out">
					<textarea
						placeholder="A chat AI agent that can allow me communicate with multiple people..."
						className="w-full bg-transparent text-white/80 placeholder:text-[#949494]/50 text-sm focus:outline-none transition duration-200 ease-in-out"
					/>
					<div className="flex items-center justify-between mt-2">
						<div className="flex items-center gap-2">
							<Button size={"icon"} className="cursor-pointer bg-[#373737] hover:bg-gray-900">
								<TbPencilDiscount />
							</Button>
							<Badge className="bg-[#373737] py-2 px-2.5 rounded-3xl text-xs text-[#7C7C7C]">0/20 Characters</Badge>
						</div>
						<Button size={"icon"} className="cursor-pointer bg-[#373737] hover:bg-gray-900">
							<GoArrowUp />
						</Button>
					</div>
				</div>
			</div>
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
				<p className="font-inter">{agentData?.name}</p>
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

export default Playground;
