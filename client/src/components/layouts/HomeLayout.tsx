import { FC, ReactNode } from "react";
import { Img } from "react-image";
import HomeNavbar from "./HomeNavbar";
import HomeFooter from "./HomeFooter";

interface HomeLayoutProps {
	children: ReactNode;
}

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
	return (
		<div
			className="min-h-screen overflow-y-auto relative w-screen text-white bg-cover bg-center overflow-x-hidden"
			style={{
				backgroundImage: "url(/images/landing-img-0.jpeg)",
			}}>
			<div className="absolute left-0 top-0 w-1/2">
				<Img src={"/images/blur-cyan.png"} className="w-full" />
			</div>
			<div className="absolute right-0 top-0 w-1/2">
				<img src={"/images/blur-purple.png"} className="w-full" />
			</div>
			<div className="w-full">
				<div className="absolute w-full h-full bg-gradient-to-b from-[#010B0F] to-transparent" />
				{/* Content */}
				<div className="relative z-10 min-h-screen px-4 pt-5 w-full">
					<HomeNavbar />
					{children}
				</div>
                <HomeFooter />
			</div>
		</div>
	);
};

export default HomeLayout;
