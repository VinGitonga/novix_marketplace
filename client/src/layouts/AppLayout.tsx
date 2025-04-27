import { Outlet } from "react-router-dom";
import AppLayoutWrapper from "./AppLayoutWrapper";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layouts/app/app-sidebar";
import { Separator } from "@/components/ui/separator";
// import AppServices from "@/providers/AppServices";

const AppLayout = () => {
	return (
		<AppLayoutWrapper>
			{/* <AppServices /> */}
			<SidebarProvider className="bg-inherit">
				<div className="flex flex-col flex-1 transition-all">
					{/* <SidebarInset className="text-white">
					</SidebarInset> */}
					<div className="flex flex-1 flex-col md:flex-row dark font-inter">
						<AppSidebar className="dark" />
						<div className="flex flex-1 flex-col px-2 md:px-[30px] py-5 overflow-y-auto h-screen bg-sidebar text-white">
							<div className="flex items-center gap-2 dark">
								<SidebarTrigger className="-ml-1" />
								<Separator orientation="vertical" className="mr-2 h-4" />
							</div>
							<Outlet />
						</div>
					</div>
				</div>
			</SidebarProvider>
		</AppLayoutWrapper>
	);
};

export default AppLayout;
