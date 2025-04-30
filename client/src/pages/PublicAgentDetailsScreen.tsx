import { Button } from "@/components/ui/button";
import { swrFetcher } from "@/lib/api-client";
import { useWallet } from "@/providers/HashinalWalletProvider";
import { IAgent } from "@/types/Agent";
import { IApiEndpoint } from "@/types/Api";
import { ArrowRightIcon } from "lucide-react";
import { Img } from "react-image";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import useSWR from "swr";
import BuyDialog from "./BuyDialog";

const PublicAgentDetailsScreen = () => {
	const params = useParams();
	const { accountId } = useWallet();
	const navigate = useNavigate();
	const { data: agentDetails, isLoading } = useSWR<IAgent>(!params.agentId ? undefined : [`${IApiEndpoint.AGENTS_GET_DETAILS}/${params.agentId}`], swrFetcher, { keepPreviousData: true });

	const onClickTry = () => {
		if (!accountId) {
			toast.warning("Kindly connect your Hedera Wallet");
			return;
		}

		navigate(`/app/agents/playground/${agentDetails?._id}`);
	};

	return (
		<div className="mt-10 text-white w-full font-inter">
			<title>Agent Details - Novix</title>

			<div className="mb-5">
				<div className="flex items-center justify-center">
					<div className="bg-gray-800 shadow-md px-2 py-1 rounded-2xl text-sm flex items-center gap-2">
						<Img src={"/images/icons/caret.png"} className="w-5 h-5" />
						<span>Finance</span>
					</div>
				</div>
			</div>
			<div className="*:w-full md:w-3/5 mx-auto mb-10">
				<div className="space-y-4 w-full">
					<h1 className="text-center font-bold font-inter text-4xl mb-10">Get Empowered By AI</h1>
					<p className="font-inter text-center text-white/80">{agentDetails?.summary}</p>
				</div>
			</div>
			<div className="flex items-center justify-center gap-4">
				{agentDetails?.price && (
					<BuyDialog agentData={agentDetails} />
				)}
				<Button onClick={onClickTry} className="bg-gradient-to-r from-[#FFFFFF]/25 to-[#030114] text-white px-4 py-2 rounded-lg font-semibold shadow font-inter cursor-pointer hover:shadow-lg transition duration-200 ease-in-out flex items-center hover:bg-white/20">
					Try it for Free
				</Button>
			</div>
			<div className="mt-28 *:w-full md:w-3/5 mx-auto mb-10">
				<div className="mb-5">
					<div className="flex items-center justify-center">
						<div className="bg-gray-800 shadow-md px-2 py-1 rounded-2xl text-sm flex items-center gap-2">
							<Img src={"/images/icons/caret.png"} className="w-5 h-5" />
							<span>Key Features</span>
						</div>
					</div>
				</div>
				<div className="space-y-4">
					<h1 className="text-center font-bold font-inter text-2xl">{agentDetails?.name}</h1>
					<p className="font-inter text-center text-white/80">{agentDetails?.description}</p>
				</div>
			</div>
			<div className="mt-10 *:w-full md:w-4/5 mx-auto mb-10">
				<div className="flex items-center justify-center w-full">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
						<div className="bg-white/5 px-8 py-7 shadow-xl rounded-3xl">
							<div className="">
								<Img src={"/images/agents/insights2.png"} className="w-full" />
							</div>
							<div className="mt-5 space-y-4">
								<h1 className="font-inter font-bold">Real-Time Market Trends</h1>
								<p>Stay ahead with live updates and predictive analytics.</p>
							</div>
						</div>
						<div className="bg-white/5 px-8 py-7 shadow-xl rounded-3xl">
							<div className="">
								<Img src={"/images/agents/market2.png"} className="w-full" />
							</div>
							<div className="mt-5 space-y-4">
								<h1 className="font-inter font-bold">Real-Time Market Trends</h1>
								<p>Stay ahead with live updates and predictive analytics.</p>
							</div>
						</div>
						<div className="bg-white/5 px-8 py-7 shadow-xl rounded-3xl">
							<div className="">
								<Img src={"/images/agents/market2.png"} className="w-full" />
							</div>
							<div className="mt-5 space-y-4">
								<h1 className="font-inter font-bold">Real-Time Market Trends</h1>
								<p>Stay ahead with live updates and predictive analytics.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="px-2 md:px-20 mt-20 w-full py-10">
				<div className="bg-white/[4%] rounded-2xl shadow-white w-full py-10">
					<div className="w-full space-y-5">
						<h1 className="text-center text-2xl font-inter font-bold">Upgrade Your Financial Research Today!</h1>
						<div className="flex items-center justify-center w-full">
							<p className="w-full md:w-1/2 text-center font-inter">Get exclusive access to advanced AI-powered insights. Make smarter decisions, faster.</p>
						</div>
						<div className="flex items-center justify-center w-full">
							<button className="bg-white text-black px-4 py-2 rounded-lg font-semibold shadow font-inter cursor-pointer hover:shadow-lg transition duration-200 ease-in-out flex items-center justify-center mt-5 hover:bg-white/80">
								Buy Now!{" "}
								<span>
									<ArrowRightIcon className="text-black/50 ml-2" />
								</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PublicAgentDetailsScreen;
