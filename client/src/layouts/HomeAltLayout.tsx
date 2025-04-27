import HomeLayout from "@/components/layouts/HomeLayout";
import { Outlet } from "react-router-dom";

const HomeAltLayout = () => {
	return (
		<HomeLayout>
			<Outlet />
		</HomeLayout>
	);
};

export default HomeAltLayout;
