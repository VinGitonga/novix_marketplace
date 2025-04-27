import { Link, useNavigate } from "react-router-dom";
import ConnectBtn from "../web3/ConnectBtn";
import { Img } from "react-image";
import SignInDialog from "../modals/SignInDialog";
import { Button } from "../ui/button";

const HomeNavbar = () => {
	const navigate = useNavigate();
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
				<Button
					variant={"secondary"}
					onClick={() => {
						navigate("/app");
					}}>
					Dashboard
				</Button>
				<SignInDialog />
				<ConnectBtn />
			</div>
		</div>
	);
};

export default HomeNavbar;
