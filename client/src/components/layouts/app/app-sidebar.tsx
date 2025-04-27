import * as React from "react";
import { AudioWaveform, BookOpen, Bot, Command, Frame, GalleryVerticalEnd, Map, PieChart, Settings2, SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/layouts/app/nav-main";
import { NavProjects } from "@/components/layouts/app/nav-projects";
import { NavUser } from "@/components/layouts/app/nav-user";
import { TeamSwitcher } from "@/components/layouts/app/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";

// This is sample data.
const data = {
	user: {
		name: "Dr. Sean",
		email: "seanvincent996@gmail.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Novix",
			logo: AudioWaveform,
			plan: "Enterprise",
		},
		// {
		// 	name: "Infinity Corp.",
		// 	logo: AudioWaveform,
		// 	plan: "Startup",
		// },
		// {
		// 	name: "Acme Corp.",
		// 	logo: Command,
		// 	plan: "Free",
		// },
	],
	navMain: [
		{
			title: "Agents",
			url: "/app/agents/my",
			icon: Bot,
			isActive: true,
			items: [
				{
					title: "My Agents",
					url: "/app/agents/my",
				},
				{
					title: "Create Agent",
					url: "/app/agents/create",
				},
			],
		},
		{
			title: "Connected Databases",
			url: "#",
			icon: SquareTerminal,
			items: [
				{
					title: "All Connections",
					url: "/app/connections",
				},
				{
					title: "Systra KSA Staging",
					url: "#",
				},
				{
					title: "Blossom Babilou Preprod",
					url: "#",
				},
				{
					title: "HEC Qatar Prod",
					url: "#",
				},
			],
		},
		{
			title: "Actions",
			url: "#",
			icon: BookOpen,
			items: [
				{
					title: "Connect Database",
					url: "/app/connect-db",
				},
				{
					title: "Ops",
					url: "/app/ops",
				},
				{
					title: "Update Leaves",
					url: "/app/update-leaves",
				},
				{
					title: "Update Employee Fields",
					url: "#",
				},
				{
					title: "Configuration Edit",
					url: "#",
				},
				{
					title: "Changelog",
					url: "#",
				},
			],
		},
		{
			title: "Settings",
			url: "#",
			icon: Settings2,
			items: [
				{
					title: "General",
					url: "#",
				},
				{
					title: "Team",
					url: "#",
				},
				{
					title: "Billing",
					url: "#",
				},
				{
					title: "Limits",
					url: "#",
				},
			],
		},
	],
	projects: [
		{
			name: "Design Engineering",
			url: "#",
			icon: Frame,
		},
		{
			name: "Sales & Marketing",
			url: "#",
			icon: PieChart,
		},
		{
			name: "Travel",
			url: "#",
			icon: Map,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavProjects projects={data.projects} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
