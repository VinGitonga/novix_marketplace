import React, { useState, useEffect } from "react";
import { HCS10Client, ConnectionsManager, Connection } from "@hashgraphonline/standards-sdk";
import { useWallet } from "@/providers/HashinalWalletProvider";

type ConnectionCardProps = { conn: Connection };
const ConnectionCard: React.FC<ConnectionCardProps> = ({ conn }) => (
	<div className="border p-4 rounded mb-2">
		<h3 className="text-lg font-bold">{conn.profileInfo?.display_name || conn.targetAccountId}</h3>
		<p>
			Status: <strong>{conn.status}</strong>
		</p>
		{conn.lastActivity && <p>Last active: {conn.lastActivity.toLocaleString()}</p>}
	</div>
);

export const ConnectionsList: React.FC = () => {
	const [conns, setConns] = useState<Connection[]>([]);

	const { browserHcsClient, accountId } = useWallet();

	console.log("browserHcsClient", browserHcsClient);

	useEffect(() => {
		async function fetchData() {
			// const client = new HCS10Client({ network: "testnet", accountId: "0.0.123456", privateKey: "KEY" });
			if (browserHcsClient) {
				const manager = new ConnectionsManager({ baseClient: browserHcsClient! });
                const cons = await manager.getActiveConnections()
                console.log('cons', cons)
				setConns(cons);
			}
		}
		fetchData();
	}, [browserHcsClient]);

	return (
		<div>
			{conns.map((c) => (
				<ConnectionCard key={c.connectionTopicId} conn={c} />
			))}
		</div>
	);
};
