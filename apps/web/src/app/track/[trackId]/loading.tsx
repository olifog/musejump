import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
	return (
		<div className="min-h-screen bg-background text-foreground p-4 md:p-8 relative">
			{/* Back Button Placeholder - Note: Actual button uses router.back(), so no interactive element needed here */}
			<div className="absolute top-4 left-4 z-10">
				<Skeleton className="h-10 w-10" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16 md:mt-8">
				{/* Left Column Skeleton */}
				<div className="md:col-span-1 flex flex-col items-center md:items-start">
					<div className="w-full max-w-sm md:max-w-full mb-6">
						<AspectRatio
							ratio={1 / 1}
							className="bg-muted rounded-lg overflow-hidden shadow-lg"
						>
							<Skeleton className="h-full w-full" />
						</AspectRatio>
					</div>
					<Skeleton className="h-8 w-3/4 mb-2" /> {/* Title */}
					<Skeleton className="h-6 w-1/2 mb-4" /> {/* Artists */}
					<div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
						<Skeleton className="h-4 w-20" /> {/* Album Name */}
						<span>•</span>
						<Skeleton className="h-4 w-12" /> {/* Duration */}
					</div>
					<Skeleton className="h-10 w-full md:w-40" /> {/* Play Button */}
				</div>

				{/* Right Column Skeleton */}
				<div className="md:col-span-2">
					<Card>
						<CardHeader>
							<div className="flex justify-between items-center">
								<CardTitle>
									<Skeleton className="h-7 w-32" /> {/* "Song Jumps" Title */}
								</CardTitle>
								<Skeleton className="h-9 w-28" /> {/* "Add Jump" Button */}
							</div>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[100px]">
											<Skeleton className="h-5 w-16" />
										</TableHead>
										<TableHead className="w-[100px]">
											<Skeleton className="h-5 w-16" />
										</TableHead>
										<TableHead>
											<Skeleton className="h-5 w-24" />
										</TableHead>
										<TableHead className="w-[100px] text-right">
											<Skeleton className="h-5 w-16" />
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{/* Show a few skeleton rows */}
									{[...Array(3)].map((_, index) => (
										<TableRow key={index}>
											<TableCell>
												<Skeleton className="h-5 w-full" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-full" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-full" />
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end space-x-1">
													<Skeleton className="h-8 w-8" /> {/* Edit Button */}
													<Skeleton className="h-8 w-8" /> {/* Delete Button */}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
