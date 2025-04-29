import { Link, useNavigate } from "react-router-dom";
import { Img } from "react-image";
import HashinalConnectBtn from "../web3/HashinalConnectBtn";
import { Button } from "../ui/button";
import { useAuthStore } from "@/hooks/store/useAuthStore";

const HomeNavbar = () => {
	const navigate = useNavigate();
	const { account } = useAuthStore();
	return (
		<div className="flex items-center justify-between px-0 md:px-12 py-5">
			<Link to={"/"}>
				<div className="flex items-center gap-2">
					<div className="flex items-center justify-center bg-white/25 px-1 py-1 rounded-full">
						<Img src={"/images/icons/logo.png"} alt="Logo" width={30} height={30} className="rounded-full" />
					</div>
					<h1 className="text-white text-2xl font-bold font-jersey-20">Novix</h1>
				</div>
			</Link>
			<div className="flex items-center gap-3">
				{account && (
					<Button
						variant={"secondary"}
						onClick={() => {
							navigate("/app");
						}}>
						Dashboard
					</Button>
				)}
				{/* <SignInDialog /> */}
				{/* <ConnectBtn /> */}
				<HashinalConnectBtn />
			</div>
		</div>
	);
};

export default HomeNavbar;
