import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/store/useChatStore";
import { cn } from "@/lib/utils";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { GoArrowUp } from "react-icons/go";
import { TbPencilDiscount } from "react-icons/tb";
import { io, Socket } from "socket.io-client";

interface Message {
	type: string;
	message: string;
	toolInput?: any;
	tool?: string;
}

const ChatScreen = () => {
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [socket, setSocket] = useState<Socket | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [sessionID, setSessionID] = useState<string | null>(null);
	const maxCharacters = 2000;
	const [isConnecting, setIsConnecting] = useState(true);

	const { input: textInput, setInput: setTextInput } = useChatStore();

	useEffect(() => {
		if (textInput) {
			setInput(textInput);
		}
	}, [textInput]);

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

	const sendMessage = (inputVal?: string) => {
		if (inputVal) {
			if (!inputVal.trim() || !socket || inputVal.length > maxCharacters || isConnecting) return;

			// Send the message
			socket.emit("message", { input: inputVal });

			// Add user message to chat
			setMessages((prev) => [...prev, { type: "user", message: inputVal }]);

			// Clear input field
			setInput("");
			setTextInput("");
		} else {
			if (!input.trim() || !socket || input.length > maxCharacters || isConnecting) return;

			// Send the message
			socket.emit("message", { input });

			// Add user message to chat
			setMessages((prev) => [...prev, { type: "user", message: input }]);

			// Clear input field
			setInput("");
		}
	};

	// Handle Enter key
	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};
	return (
		<>
			<title>Chat - Novix</title>
			<div className="mt-10 text-white w-full max-h-screen overflow-y-auto">
				<div className="mb-5">
					<div className="flex items-center justify-center">
						<div className="mb-4 border-b border-gray-800 pb-2 text-center">
							<h1 className="text-xl font-bold">Chat with Novix AI</h1>
							<p className="text-sm text-gray-400">Ask questions or give instructions to the AI assistant</p>
						</div>
					</div>
				</div>
				<div className="h-[80vh] md:px-20 lg:px-40">
					<div className="h-full flex flex-col relative">
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
												<AvatarImage src={msg.type === "user" ? `https://api.dicebear.com/9.x/adventurer/svg?seed=user` : "/images/agent-avatar.png"} alt={msg.type === "user" ? "You" : "Agent"} />
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
												<pre className="text-xs mt-2 bg-gray-900/50 p-2 rounded overflow-x-auto">{typeof msg.toolInput === "string" ? msg.toolInput : JSON.stringify(msg.toolInput, null, 2)}</pre>
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
					</div>
					<div className="absolute bottom-10 left-0 right-0 md:px-20 lg:px-40 bg-black/10 backdrop-blur-sm">
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
									onClick={() => sendMessage()}
									disabled={!input.trim() || input.length > maxCharacters || isConnecting}>
									<GoArrowUp className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ChatScreen;
