import { ArrowRightIcon } from "lucide-react";
import { Img } from "react-image";
import { Button } from "@/components/ui/button";
import { TbPencilDiscount } from "react-icons/tb";
import { GoArrowUp } from "react-icons/go";
import { Badge } from "@/components/ui/badge";
import HomeLayout from "@/components/layouts/HomeLayout";
import { FC } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

interface Agent {
	name: string;
	description: string;
	price: string;
	accuracy: string;
	backgroundImage: string;
}

const agents: Agent[] = [
	{
		name: "SentimentAnalysisBots",
		description: "Analyzes text to determine positive, negative, or neutral sentiment.",
		price: "0.1 ETH",
		accuracy: "95%",
		backgroundImage: "/images/bg/card-bg-1.png",
	},
	{
		name: "ImageGenAI",
		description: "Generate high-quality images from text prompts.",
		price: "0.2 ETH",
		accuracy: "Free Trial Available",
		backgroundImage: "/images/bg/card-bg-2.png",
	},
	{
		name: "ChatBotPro",
		description: "Automates customer support with natural conversations.",
		price: "0.15 ETH",
		accuracy: "95%",
		backgroundImage: "/images/bg/card-bg-1.png",
	},
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

const HomeScreen = () => {
	return (
		<HomeLayout>
			<Helmet>
				<title>Novix</title>
			</Helmet>
			<div className="mt-10 text-white w-full">
				<div className="mb-5">
					<div className="flex items-center justify-center">
						<div className="bg-gray-800 shadow-md px-2 py-1 rounded-2xl text-sm flex items-center gap-2">
							<Img src={"/images/icons/caret.png"} className="w-5 h-5" />
							<span>AI Marketplace</span>
						</div>
					</div>
				</div>
				<div className="*:w-full md:w-3/5 mx-auto mb-10">
					<div className="space-y-4 w-full">
						<h1 className="text-center font-bold font-inter text-4xl mb-10">Shop & Test AI Agents in One Place</h1>
						<p className="font-inter text-center text-white/80">
							Discover, try, and buy powerful AI agents built to solve real problems. Your personal AI assistant, business partner, or creative genius is just a click away.
						</p>
					</div>
				</div>
				<div className="mt-5 *:w-full md:w-1/2 mx-auto">
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
				{/* <div className="mt-5 px-5 *:w-full md:w-2/5 mx-auto">
							<div className={"bg-transparent rounded-lg border border-white/20 shadow-lg focus:border-2 focus:border-white transition duration-200 ease-in-out"}>
								<div className="flex items-center px-4 py-2">
									<SearchIcon className="text-white/50" />
									<input
										type="text"
										placeholder="Search for AI agents..."
										className="w-full px-4 py-2 bg-transparent text-white placeholder:text-white/50 focus:outline-none transition duration-200 ease-in-out"
									/>
								</div>
							</div>
						</div> */}
				{/* <div className="mt-5 mx-auto *:w-full md:w-3/4">
							<Img src={"/images/hero-img1.png"} alt="AI Marketplace" width={500} height={500} className="rounded-lg shadow-lg" />
						</div> */}
				<div className="mt-40">
					{/* <div className="space-y-4">
								<h1 className="text-center font-bold font-inter text-2xl">Explore Our AI Agents</h1>
								<p className="font-inter text-center">Browse a diverse range of AI agents built by developers. Test their capabilities in our playground and license the ones that fit your needs</p>
							</div> */}
					<div className="mb-5">
						<div className="flex items-center justify-center">
							<div className="bg-gray-800 shadow-md px-2 py-1 rounded-2xl text-sm flex items-center gap-2">
								<Img src={"/images/icons/brain.png"} className="w-5 h-5" />
								<span>Explore</span>
							</div>
						</div>
					</div>
					<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-x-7 gap-y-10 px-2 md:px-20">
						{agents.map((agent, index) => (
							<Link to={"/public/agent-details"}>
								<AgentDetailsCard key={index} agentData={agent} />
							</Link>
						))}
					</div>
				</div>
				<div className="px-2 md:px-20 mt-20 w-full py-10">
					<div className="bg-white/[4%] rounded-2xl shadow-white w-full py-10">
						<div className="w-full space-y-5">
							<h1 className="text-center text-2xl font-inter font-bold">Give it a shot, try out AI Marketplace</h1>
							<div className="flex items-center justify-center w-full">
								<p className="w-full md:w-1/2 text-center font-inter">
									Getting started is easy! create a free account on our website, explore popular AI agents, try it out on our online playgrounf and start building the future
								</p>
							</div>
							<div className="flex items-center justify-center w-full">
								<button className="bg-white text-black px-4 py-2 rounded-lg font-semibold shadow font-inter cursor-pointer hover:shadow-lg transition duration-200 ease-in-out flex items-center justify-center mt-5 hover:bg-white/80">
									Give it a try{" "}
									<span>
										<ArrowRightIcon className="text-black/50 ml-2" />
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className="absolute -bottom-20 -right-20 w-2/5 pointer-events-none">
					<img src={"/images/blur-purple.png"} className="w-full" />
				</div>
				{/* New bgs */}
				<div className="absolute -left-60 -top-48 w-3/4 pointer-events-none">
					<img src={"/images/blur-cyan.png"} className="w-full" />
				</div>
				<div className="absolute -top-48 -right-60 w-3/4 pointer-events-none">
					<img src={"/images/blur-purple.png"} className="w-full" />
				</div>
			</div>
		</HomeLayout>
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

export default HomeScreen;
