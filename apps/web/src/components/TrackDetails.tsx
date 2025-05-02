"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Track } from "@spotify/web-api-ts-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Plus, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Segment } from "./song-structure-visualizer";
import { TrackAnalysis } from "./track-analysis";

interface TrackDetailsProps {
	track: Track;
}

// Convert milliseconds to MM:SS.S format
const formatTime = (ms: number): string => {
	const totalSeconds = ms / 1000;
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
};

// Convert MM:SS.S format to milliseconds
const parseTime = (timeStr: string): number => {
	const parts = timeStr.split(":");
	if (parts.length !== 2) return 0;

	const minutes = Number.parseInt(parts[0]!, 10);
	const seconds = Number.parseFloat(parts[1]!);
	return (minutes * 60 + seconds) * 1000;
};

// Base schema including duration for validation context
const jumpSchema = (durationMs: number) =>
	z
		.object({
			trigger: z.string().regex(/^\d+:\d+(\.\d)?$/, "Must be in format M:SS.S"),
			target: z.string().regex(/^\d+:\d+(\.\d)?$/, "Must be in format M:SS.S"),
			description: z.string().optional(),
		})
		.refine((data) => parseTime(data.trigger) < durationMs, {
			message: "Trigger time must be less than track duration",
			path: ["trigger"],
		})
		.refine((data) => parseTime(data.target) < durationMs, {
			message: "Target time must be less than track duration",
			path: ["target"],
		});

// Infer the type from the schema *factory*
// We need a concrete duration to infer, 0 is arbitrary but works for type inference
type JumpFormData = z.infer<ReturnType<typeof jumpSchema>>;

export const TrackDetails = ({ track }: TrackDetailsProps) => {
	const [editingJump, setEditingJump] = useState<string | null>(null);
	const [isAddingJump, setIsAddingJump] = useState(false);

	const router = useRouter();
	const trpc = useTRPC();

	const { data: jumps, refetch: refetchJumps } = useQuery(
		trpc.jumps.getJumps.queryOptions({
			songId: track.id,
		}),
	);

	const addJumpMutation = useMutation(
		trpc.jumps.addJump.mutationOptions({
			onSuccess: () => {
				refetchJumps();
				setIsAddingJump(false);
			},
		}),
	);

	const updateJumpMutation = useMutation(
		trpc.jumps.updateJump.mutationOptions({
			onSuccess: () => {
				refetchJumps();
				setEditingJump(null);
			},
		}),
	);

	const deleteJumpMutation = useMutation(
		trpc.jumps.deleteJump.mutationOptions({
			onSuccess: () => refetchJumps(),
		}),
	);

	// Format duration for display only
	const minutes = Math.floor(track.duration_ms / 60000);
	const seconds = Math.floor((track.duration_ms % 60000) / 1000);
	const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

	// Create the specific resolver using the track's duration
	const resolver = zodResolver(jumpSchema(track.duration_ms));

	const newJumpForm = useForm<JumpFormData>({
		resolver,
		defaultValues: {
			trigger: "0:00.0",
			target: "0:00.0",
			description: "",
		},
	});

	const editJumpForm = useForm<JumpFormData>({
		resolver,
		defaultValues: {
			trigger: "0:00.0",
			target: "0:00.0",
			description: "",
		},
	});

	// Reset the form when switching to add mode
	useEffect(() => {
		if (isAddingJump) {
			newJumpForm.reset({
				trigger: "0:00.0",
				target: "0:00.0",
				description: "",
			});
		}
	}, [isAddingJump, newJumpForm.reset]);

	// Set form values when editing
	useEffect(() => {
		if (editingJump !== null && jumps) {
			const jump = jumps.find((j) => j.id === editingJump);
			if (jump) {
				editJumpForm.reset({
					trigger: formatTime(jump.trigger),
					target: formatTime(jump.target),
					description: jump.description || "",
				});
			}
		}
	}, [editingJump, jumps, editJumpForm.reset]);

	const onAddJump = (data: JumpFormData) => {
		addJumpMutation.mutate({
			songId: track.id,
			trigger: parseTime(data.trigger),
			target: parseTime(data.target),
			description: data.description,
		});
	};

	const onUpdateJump = (data: JumpFormData) => {
		if (!editingJump) return;

		updateJumpMutation.mutate({
			id: editingJump,
			trigger: parseTime(data.trigger),
			target: parseTime(data.target),
			description: data.description,
		});
	};

	const onDeleteJump = (jumpId: string) => {
		deleteJumpMutation.mutate({ id: jumpId });
	};

	const skipSegment = async (segment: Segment) => {
		addJumpMutation.mutate({
			songId: track.id,
			trigger: Math.round(segment.start * 1000),
			target: Math.round(segment.end * 1000),
			description: `Skip ${segment.label}`,
		});
	};

	const repeatSegment = async (segment: Segment) => {
		addJumpMutation.mutate({
			songId: track.id,
			trigger: Math.round(segment.end * 1000),
			target: Math.round(segment.start * 1000),
			description: `Repeat ${segment.label}`,
		});
	};

	return (
		<div className="min-h-screen bg-background text-foreground p-4 md:p-8">
			{/* Back Button - Top Left */}
			<Button
				variant="ghost"
				size="icon"
				onClick={() => router.back()}
				className="absolute top-4 left-4 text-muted-foreground hover:text-foreground z-10"
			>
				<ArrowLeft size={24} />
			</Button>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16 md:mt-8">
				{/* Left Column: Track Info & Cover */}
				<div className="md:col-span-1 flex flex-col items-center md:items-start">
					{track.album.images?.[0]?.url && (
						<div className="w-full max-w-sm md:max-w-full mb-6">
							<AspectRatio
								ratio={1 / 1}
								className="bg-muted rounded-lg overflow-hidden shadow-lg"
							>
								<Image
									src={track.album.images[0].url}
									alt={track.name}
									fill
									className="object-cover"
									priority
								/>
							</AspectRatio>
						</div>
					)}

					<h1 className="text-3xl font-bold text-center md:text-left mb-2 leading-tight">
						{track.name}
					</h1>
					<p className="text-xl text-muted-foreground text-center md:text-left mb-4">
						{track.artists.map((artist) => artist.name).join(", ")}
					</p>

					<div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
						<span>{track.album.name}</span>
						<span>•</span>
						<span>{formattedDuration}</span>
					</div>

					<Link
						href={track.external_urls.spotify}
						target="_blank"
						rel="noopener noreferrer"
						className="w-full md:w-auto"
					>
						<Button className="w-full md:w-auto">Play on Spotify</Button>
					</Link>
				</div>

				{/* Right Column: Song Jumps & Analysis */}
				<div className="md:col-span-2 flex flex-col gap-4">
					<Card>
						<CardHeader>
							<div className="flex justify-between items-center">
								<CardTitle className="text-2xl">Song Jumps</CardTitle>
								{!isAddingJump && (
									<Button
										variant="default"
										size="sm"
										onClick={() => setIsAddingJump(true)}
									>
										<Plus size={16} className="mr-1" /> Add Jump
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{isAddingJump && (
								<Card className="mb-6 bg-secondary border-none">
									<CardHeader>
										<CardTitle className="text-lg font-medium">
											New Jump
										</CardTitle>
									</CardHeader>
									<CardContent>
										<Form {...newJumpForm}>
											<form
												onSubmit={newJumpForm.handleSubmit(onAddJump)}
												className="space-y-4"
											>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													<FormField
														control={newJumpForm.control}
														name="trigger"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Trigger (M:SS.S)</FormLabel>
																<FormControl>
																	<Input {...field} placeholder="0:00.0" />
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={newJumpForm.control}
														name="target"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Target (M:SS.S)</FormLabel>
																<FormControl>
																	<Input {...field} placeholder="0:00.0" />
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
												<FormField
													control={newJumpForm.control}
													name="description"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Description (Optional)</FormLabel>
															<FormControl>
																<Input
																	{...field}
																	placeholder="e.g., Skip intro"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<div className="flex justify-end gap-2">
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => setIsAddingJump(false)}
													>
														Cancel
													</Button>
													<Button
														type="submit"
														size="sm"
														disabled={addJumpMutation.isPending}
													>
														{addJumpMutation.isPending
															? "Saving..."
															: "Save Jump"}
													</Button>
												</div>
											</form>
										</Form>
									</CardContent>
								</Card>
							)}

							{jumps && jumps.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[100px]">Trigger</TableHead>
											<TableHead className="w-[100px]">Target</TableHead>
											<TableHead>Description</TableHead>
											<TableHead className="w-[100px] text-right">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{jumps.map((jump) => (
											<TableRow
												key={jump.id}
												className={editingJump === jump.id ? "bg-muted/50" : ""}
											>
												{editingJump === jump.id ? (
													<TableCell colSpan={4} className="p-0">
														<div className="p-4">
															<Form {...editJumpForm}>
																<form
																	onSubmit={editJumpForm.handleSubmit(
																		onUpdateJump,
																	)}
																	className="space-y-4"
																>
																	<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
																		<FormField
																			control={editJumpForm.control}
																			name="trigger"
																			render={({ field }) => (
																				<FormItem>
																					<FormLabel>
																						Trigger (M:SS.S)
																					</FormLabel>
																					<FormControl>
																						<Input {...field} />
																					</FormControl>
																					<FormMessage />
																				</FormItem>
																			)}
																		/>
																		<FormField
																			control={editJumpForm.control}
																			name="target"
																			render={({ field }) => (
																				<FormItem>
																					<FormLabel>Target (M:SS.S)</FormLabel>
																					<FormControl>
																						<Input {...field} />
																					</FormControl>
																					<FormMessage />
																				</FormItem>
																			)}
																		/>
																	</div>
																	<FormField
																		control={editJumpForm.control}
																		name="description"
																		render={({ field }) => (
																			<FormItem>
																				<FormLabel>
																					Description (Optional)
																				</FormLabel>
																				<FormControl>
																					<Input {...field} />
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																	<div className="flex justify-end gap-2">
																		<Button
																			type="button"
																			variant="ghost"
																			size="sm"
																			onClick={() => setEditingJump(null)}
																		>
																			Cancel
																		</Button>
																		<Button
																			type="submit"
																			size="sm"
																			disabled={updateJumpMutation.isPending}
																		>
																			{updateJumpMutation.isPending
																				? "Updating..."
																				: "Update Jump"}
																		</Button>
																	</div>
																</form>
															</Form>
														</div>
													</TableCell>
												) : (
													<>
														<TableCell className="font-mono">
															{formatTime(jump.trigger)}
														</TableCell>
														<TableCell className="font-mono">
															{formatTime(jump.target)}
														</TableCell>
														<TableCell>
															{jump.description || (
																<span className="text-muted-foreground">-</span>
															)}
														</TableCell>
														<TableCell className="text-right">
															<div className="flex justify-end space-x-1">
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => setEditingJump(jump.id)}
																	className="h-8 w-8"
																>
																	<Edit size={16} />
																	<span className="sr-only">Edit Jump</span>
																</Button>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => onDeleteJump(jump.id)}
																	disabled={
																		deleteJumpMutation.isPending &&
																		deleteJumpMutation.variables?.id === jump.id
																	}
																	className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
																>
																	<Trash size={16} />
																	<span className="sr-only">Delete Jump</span>
																</Button>
															</div>
														</TableCell>
													</>
												)}
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								!isAddingJump && (
									<div className="text-center py-12 text-muted-foreground">
										<p>No jumps configured for this track.</p>
										<p className="text-sm mt-1">
											Click "Add Jump" to create one.
										</p>
									</div>
								)
							)}
						</CardContent>
					</Card>
					<TrackAnalysis
						track={track}
						skipSegment={skipSegment}
						repeatSegment={repeatSegment}
					/>
				</div>
			</div>
		</div>
	);
};
