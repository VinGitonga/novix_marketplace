const HomeFooter = () => {
	return (
		<div className="mt-10 w-full relative">
			<div className="absolute -left-48 bottom-1 w-2/5">
				<img src={"/images/blur-cyan.png"} className="w-full" />
			</div>
			<div className="bg-white/[3%] shadow-white/20 w-full py-10">
				<div className="w-full md:w-3/4 flex flex-col items-center justify-center mx-auto gap-5">
					<div className="flex items-center justify-center gap-2 w-full">
						<p>Why Us</p>
						<p>AI Agents</p>
						<p>AI Playground</p>
						<p>Connect Wallet</p>
					</div>
					<hr className="border border-white/20 w-full" />
					<p className="text-[#bababa] font-inter text-sm">&copy;2025 AI Agent Marketplace</p>
				</div>
			</div>
		</div>
	);
};

export default HomeFooter;
