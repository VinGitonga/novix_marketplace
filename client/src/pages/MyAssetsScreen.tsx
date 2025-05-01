import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/hooks/store/useAuthStore";
import { swrFetcher } from "@/lib/api-client";
import { IApiEndpoint } from "@/types/Api";
import { IAssetInfo } from "@/types/Asset";
import useSWR from "swr";

const MyAssetsScreen = () => {
	const { account } = useAuthStore();
	const { data, isLoading } = useSWR<IAssetInfo[]>(!account ? undefined : [`${IApiEndpoint.ASSETS_GET_BY_OWNER}/${account?.accountId}`], swrFetcher, { keepPreviousData: true });
	return (
		<>
			<title>My Assets - Novix</title>
			<div className="space-y-2 mt-3 mb-5">
				<h1 className="text-lg font-semibold">My Assets</h1>
				<p className="text-gray-300 text-sm">This page allows you to setup new assets and configure a new assets tailored for market needs.</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
				{isLoading && [...Array.from({ length: 5 })].map((_, idx) => <SkeletonCard key={idx} />)}
				{data && data.map((item) => <AssetCard key={item._id} item={item} />)}
			</div>
		</>
	);
};

const AssetCard = ({ item }: { item: IAssetInfo }) => {
	return (
		<div className="bg-white/5 px-8 py-7 shadow-xl rounded-3xl space-y-4">
			<h1 className="text-lg font-inter">{item.metadata.general.name}</h1>
			<div>
				<p className="text-sm">{item.metadata.general.description}</p>
			</div>
			<div className="flex items-center gap-2">
				<Badge>{item.metadata.asset_type}</Badge>
				<Badge>{item.metadata.licensing.license_type}</Badge>
			</div>
		</div>
	);
};

function SkeletonCard() {
	return (
		<div className="flex flex-col space-y-3">
			<Skeleton className="h-[125px] w-[250px] rounded-xl" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-[250px]" />
				<Skeleton className="h-4 w-[200px]" />
			</div>
		</div>
	);
}

export default MyAssetsScreen;
