import { ArrowRightIcon } from "lucide-react";
import { Img } from "react-image";
import { Button } from "@/components/ui/button";
import { TbPencilDiscount } from "react-icons/tb";
import { GoArrowUp } from "react-icons/go";
import { Badge } from "@/components/ui/badge";
import HomeLayout from "@/components/layouts/HomeLayout";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import useDisclosure from "@/hooks/useDisclosure";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { io, Socket } from "socket.io-client";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/hooks/store/useChatStore";

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

interface Message {
	type: string;
	message: string;
	toolInput?: any;
	tool?: string;
}

const HomeScreen = () => {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [socket, setSocket] = useState<Socket | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [sessionID, setSessionID] = useState<string | null>(null);
	const maxCharacters = 2000;
	const [isConnecting, setIsConnecting] = useState(true);
	const { input: textInput, setInput: setTextInput } = useChatStore();

	const navigate = useNavigate();

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Initialize WebSocket connection
	useEffect(() => {
		const newSocket = io("http://localhost:7834", {
			path: "/api/agent/socket",
			auth: {
				sessionID: sessionID || null,
			},
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
		});

		setIsConnecting(true);
		newSocket.connect();

		newSocket.on("connect", () => {
			console.log("Connected to agent server");
			setIsConnecting(false);
			setMessages((prev) => [...prev, { type: "system", message: "Connected to the agent" }]);
		});

		newSocket.on("connect_error", (error) => {
			console.error("Connection error:", error);
			setIsConnecting(false);
			setMessages((prev) => [...prev, { type: "error", message: `Connection error: ${error.message}` }]);
		});

		newSocket.on("session", (data: { sessionID: string }) => {
			setSessionID(data.sessionID);
			localStorage.setItem("agent_session_id", data.sessionID);
			console.log("Received session ID:", data.sessionID);
		});

		// Updated message handler to match server implementation
		newSocket.on("message", (data: Message) => {
			console.log("Received message:", data);

			if (data.type === "done") {
				// setMessages((prev) => [...prev, { type: "system", message: "Agent completed" }]);
			} else if (data.type === "thinking") {
				// Show the agent's thinking process
				setMessages((prev) => [...prev, { type: "thinking", message: data.message }]);
			} else if (data.type === "action") {
				// Tool being called
				setMessages((prev) => [
					...prev,
					{
						type: "action",
						message: data.message,
						tool: data.tool,
						toolInput: data.toolInput,
					},
				]);
			} else if (data.type === "observation") {
				// Tool results
				setMessages((prev) => [
					...prev,
					{
						type: "observation",
						message: data.message,
						tool: data.tool,
					},
				]);
			} else if (data.type === "output") {
				// Final answer
				setMessages((prev) => [...prev, { type: "output", message: data.message }]);
			} else {
				// Handle any other types
				setMessages((prev) => [...prev, data]);
			}
		});

		newSocket.on("error", (data: { message: string }) => {
			setMessages((prev) => [...prev, { type: "error", message: data.message }]);
		});

		newSocket.on("disconnect", () => {
			setMessages((prev) => [...prev, { type: "system", message: "Disconnected from agent" }]);
		});

		setSocket(newSocket);

		// Try to restore session ID from localStorage
		const savedSessionId = localStorage.getItem("agent_session_id");
		if (savedSessionId) {
			setSessionID(savedSessionId);
		}

		return () => {
			newSocket.disconnect();
		};
	}, []);

	const sendMessage = () => {
		if (!input.trim() || !socket || input.length > maxCharacters || isConnecting) return;

		// Send the message
		socket.emit("message", { input });

		// Add user message to chat
		setMessages((prev) => [...prev, { type: "user", message: input }]);

		// Clear input field
		setInput("");
	};

	// Handle Enter key
	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const submitChatInput = () => {
		navigate("/chat");
	};

	const onKeyDownChatInput = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submitChatInput();
		}
	};

	return (
		<HomeLayout>
			<title>Novix</title>
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
							value={textInput}
							onChange={(e) => setTextInput(e.target.value)}
							onKeyDown={onKeyDownChatInput}
						/>
						<div className="flex items-center justify-between mt-2">
							<div className="flex items-center gap-2">
								<Button size={"icon"} className="cursor-pointer bg-[#373737] hover:bg-gray-900">
									<TbPencilDiscount />
								</Button>
								<Badge className="bg-[#373737] py-2 px-2.5 rounded-3xl text-xs text-[#7C7C7C]">
									{textInput.length}/{maxCharacters} Characters
								</Badge>
							</div>
							<Button onClick={submitChatInput} size={"icon"} className="cursor-pointer bg-[#373737] hover:bg-gray-900">
								<GoArrowUp />
							</Button>
						</div>
					</div>
				</div>
				<div className="mt-40">
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
							<Link key={index} to={"/public/agent-details"}>
								<AgentDetailsCard agentData={agent} />
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
									Getting started is easy! create a free account on our website, explore popular AI agents, try it out on our online playground and start building the future
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
				<div className="absolute -left-60 -top-48 w-3/4 pointer-events-none">
					<img src={"/images/blur-cyan.png"} className="w-full" />
				</div>
				<div className="absolute -top-48 -right-60 w-3/4 pointer-events-none">
					<img src={"/images/blur-purple.png"} className="w-full" />
				</div>
			</div>
			<Dialog open={isOpen} onOpenChange={onOpenChange}>
				<DialogContent className="min-w-3xl bg-[#010B0F] text-white overflow-y-auto max-h-[90vh] min-h-[600px]">
					<div className="mb-4 border-b border-gray-800 pb-2">
						<h1 className="text-xl font-bold">Chat with Novix AI</h1>
						<p className="text-sm text-gray-400">Ask questions or give instructions to the AI assistant</p>
					</div>
					<div className="h-[80vh]">
						<div className="col-span-6 relative flex flex-col h-[80vh]">
							{/* Scrollable Messages Container */}
							<div className="flex-1 overflow-y-auto p-4 space-y-4 pb-48">
								{/* Welcome message */}
								{messages.length === 0 && (
									<div className="flex justify-center">
										<div className="bg-gray-800/80 text-center rounded-xl px-4 py-3">
											<p className="text-sm">Welcome to Novix AI. Type a message to get started.</p>
										</div>
									</div>
								)}

								{/* Message bubbles */}
								{messages.map((msg, index) => (
									<div key={index} className={cn("flex", msg.type === "user" ? "justify-end" : "justify-start")}>
										<div className="flex gap-4 items-start max-w-[80%]">
											{/* Avatar */}
											{msg.type !== "system" && (
												<Avatar className="mt-1">
													<AvatarImage
														src={msg.type === "user" ? `https://api.dicebear.com/9.x/adventurer/svg?seed=user` : "/images/agent-avatar.png"}
														alt={msg.type === "user" ? "You" : "Agent"}
													/>
													<AvatarFallback>{msg.type === "user" ? "U" : "AI"}</AvatarFallback>
												</Avatar>
											)}

											{/* Message bubble */}
											<div
												className={cn(
													"px-3 py-2.5 rounded-xl",
													msg.type === "user"
														? "bg-gray-700/80"
														: msg.type === "error"
														? "bg-red-600/80"
														: msg.type === "system"
														? "bg-gray-800/80 text-center w-full"
														: msg.type === "thinking"
														? "bg-blue-900/40 italic"
														: msg.type === "action"
														? "bg-purple-900/40"
														: msg.type === "observation"
														? "bg-green-900/40"
														: msg.type === "output"
														? "bg-gray-800/80 font-medium"
														: "bg-gray-800/80"
												)}>
												{/* Message header/label */}
												{msg.type !== "system" && (
													<p className="text-xs font-semibold mb-1">
														{msg.type === "user"
															? "You"
															: msg.type === "thinking"
															? "Agent thinking..."
															: msg.type === "action"
															? `Using tool: ${msg.tool || ""}`
															: msg.type === "observation"
															? `Tool result: ${msg.tool || ""}`
															: msg.type === "output"
															? "Final answer"
															: "Agent"}
													</p>
												)}

												{/* Message content */}
												<p className={cn("text-sm whitespace-pre-wrap", msg.type === "thinking" && "italic text-gray-300")}>{msg.message}</p>

												{/* Tool input display */}
												{msg.toolInput && (
													<pre className="text-xs mt-2 bg-gray-900/50 p-2 rounded overflow-x-auto">
														{typeof msg.toolInput === "string" ? msg.toolInput : JSON.stringify(msg.toolInput, null, 2)}
													</pre>
												)}
											</div>
										</div>
									</div>
								))}

								{/* Connection status message */}
								{isConnecting && (
									<div className="flex justify-center">
										<div className="bg-gray-800/80 text-center rounded-xl px-4 py-2">
											<p className="text-sm">Connecting to agent...</p>
										</div>
									</div>
								)}

								<div ref={messagesEndRef} />
							</div>

							{/* Fixed Textarea Container */}
							<div className="absolute bottom-0 left-0 right-0 p-4 bg-black/10 backdrop-blur-sm">
								<div className="bg-white/5 py-6 px-8 rounded-2xl border border-white/20 shadow-lg focus-within:border-2 focus-within:border-white transition duration-200 ease-in-out">
									<textarea
										placeholder="Ask a question or give instructions to the AI..."
										className="w-full bg-transparent text-white/80 placeholder:text-gray-500/50 text-sm focus:outline-none transition duration-200 ease-in-out resize-none"
										rows={2}
										value={input}
										onChange={(e) => setInput(e.target.value)}
										onKeyDown={handleKeyPress}
										maxLength={maxCharacters}
										disabled={isConnecting}
									/>
									<div className="flex items-center justify-between mt-2">
										<div className="flex items-center gap-2">
											<Button size="sm" variant="outline" className="cursor-pointer bg-gray-800 hover:bg-gray-900 h-8 w-8 p-0">
												<TbPencilDiscount className="h-4 w-4" />
											</Button>
											<Badge className="bg-gray-800 py-2 px-2.5 rounded-3xl text-xs text-gray-400">
												{input.length}/{maxCharacters} Characters
											</Badge>
										</div>
										<Button
											size="sm"
											variant="outline"
											className="cursor-pointer bg-gray-800 hover:bg-gray-900 h-8 w-8 p-0"
											onClick={sendMessage}
											disabled={!input.trim() || input.length > maxCharacters || isConnecting}>
											<GoArrowUp className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</HomeLayout>
	);
};

const AgentDetailsCard: FC<{ agentData: Agent }> = ({ agentData }) => {
	return (
		<div style={{ backgroundImage: `url(${agentData.backgroundImage})` }} className="w-full bg-cover bg-center px-4 py-5 rounded-lg shadow-lg">
			<div className="space-y-8">
				<h2 className="font-inter text-lg font-bold">{agentData.name}</h2>
				<p className="font-inter">{agentData.description}</p>
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
