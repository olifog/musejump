import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const SkeletonRow = ({
	hasImage,
	hasIndex,
}: {
	hasImage?: boolean;
	hasIndex?: boolean;
}) => (
	<TableRow>
		{hasIndex && (
			<TableCell className="w-[40px] text-center">
				<Skeleton className="h-4 w-4 mx-auto" />
			</TableCell>
		)}
		{hasImage && (
			<TableCell className="w-[50px]">
				<Skeleton className="h-8 w-8 rounded" />
			</TableCell>
		)}
		<TableCell>
			<Skeleton className="h-4 w-[180px]" />
		</TableCell>
		<TableCell>
			<Skeleton className="h-4 w-[120px]" />
		</TableCell>
		<TableCell className="text-right">
			<Skeleton className="h-4 w-12 ml-auto" />
		</TableCell>
	</TableRow>
);

export default function Loading() {
	return (
		<div className="min-h-screen p-4">
			{/* User Header Skeleton */}
			<div className="flex items-center gap-3 mb-4 p-2 bg-card rounded-lg border">
				<Skeleton className="h-10 w-10 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-3 w-20" />
				</div>
			</div>

			{/* Search Section Skeleton */}
			<div className="bg-card rounded-lg p-3 mb-3 border">
				<Skeleton className="h-4 w-28 mb-3" />
				<Skeleton className="h-10 w-full rounded-lg" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{/* Recently Played Section Skeleton */}
				<div className="bg-card rounded-lg p-3 border">
					<Skeleton className="h-4 w-36 mb-4" />
					<div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]">
										<Skeleton className="h-4 w-full" />
									</TableHead>
									<TableHead>
										<Skeleton className="h-4 w-full" />
									</TableHead>
									<TableHead>
										<Skeleton className="h-4 w-full" />
									</TableHead>
									<TableHead className="text-right">
										<Skeleton className="h-4 w-12 ml-auto" />
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{Array(10)
									.fill(0)
									.map((_, i) => (
										<SkeletonRow key={`recent-${i}`} hasImage />
									))}
							</TableBody>
						</Table>
					</div>
				</div>

				{/* Top Tracks Section Skeleton */}
				<div className="bg-card rounded-lg p-3 border">
					<Skeleton className="h-4 w-28 mb-4" />
					<div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[40px] text-center">#</TableHead>
									<TableHead className="w-[50px]">
										<Skeleton className="h-4 w-full" />
									</TableHead>
									<TableHead>
										<Skeleton className="h-4 w-full" />
									</TableHead>
									<TableHead>
										<Skeleton className="h-4 w-full" />
									</TableHead>
									<TableHead className="text-right">
										<Skeleton className="h-4 w-12 ml-auto" />
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{Array(10)
									.fill(0)
									.map((_, i) => (
										<SkeletonRow key={`top-${i}`} hasImage hasIndex />
									))}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>
		</div>
	);
}
