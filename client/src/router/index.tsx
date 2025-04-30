import AppLayout from "@/layouts/AppLayout";
import HomeAltLayout from "@/layouts/HomeAltLayout";
import CreateAgent from "@/pages/agents/my/CreateAgent";
import MyAgents from "@/pages/agents/my/MyAgents";
import Playground from "@/pages/agents/Playground";
import ChatScreen from "@/pages/ChatScreen";
import { ConnectionsList } from "@/pages/Connections";
import Dashboard from "@/pages/Dashboard";
import HomeScreen from "@/pages/HomeScreen";
import PublicAgentDetailsScreen from "@/pages/PublicAgentDetailsScreen";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
	{
		path: "/",
		element: <HomeScreen />,
	},
	{
		path: "public",
		element: <HomeAltLayout />,
		children: [
			{
				path: "agent-details/:agentId",
				element: <PublicAgentDetailsScreen />,
			},
		],
	},
	{
		path: "chat",
		element: <HomeAltLayout />,
		children: [
			{
				path: "",
				element: <ChatScreen />,
			},
		],
	},
	{
		path: "app",
		element: <AppLayout />,
		children: [
			{
				path: "",
				element: <Dashboard />,
			},
			{
				path: "agents",
				element: <MyAgents />,
			},
			{
				path: "agents/my",
				element: <MyAgents />,
			},
			{
				path: "agents/create",
				element: <CreateAgent />,
			},
			{
				path: "agents/playground/:agentId",
				element: <Playground />,
			},
			{
				path: "connections",
				element: <ConnectionsList />
			}
		],
	},
]);

export default router;
