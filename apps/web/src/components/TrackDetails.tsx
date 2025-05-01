"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, Edit, Trash, Plus } from "lucide-react";
import { Track } from "@spotify/web-api-ts-sdk";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface TrackDetailsProps {
  track: Track;
}

// Convert milliseconds to MM:SS.S format
const formatTime = (ms: number): string => {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`;
};

// Convert MM:SS.S format to milliseconds
const parseTime = (timeStr: string): number => {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  
  const minutes = parseInt(parts[0]!, 10);
  const seconds = parseFloat(parts[1]!);
  return (minutes * 60 + seconds) * 1000;
};

const jumpSchema = z.object({
  trigger: z.string().regex(/^\d+:\d+(\.\d)?$/, "Must be in format M:SS.S"),
  target: z.string().regex(/^\d+:\d+(\.\d)?$/, "Must be in format M:SS.S"),
  description: z.string().optional(),
});

export const TrackDetails = ({ track }: TrackDetailsProps) => {
  const [editingJump, setEditingJump] = useState<string | null>(null);
  const [isAddingJump, setIsAddingJump] = useState(false);
  
  const router = useRouter();
  const trpc = useTRPC();
  
  const { data: jumps, refetch: refetchJumps } = useQuery(
    trpc.jumps.getJumps.queryOptions({
      songId: track.id,
    })
  );

  const addJumpMutation = useMutation(
    trpc.jumps.addJump.mutationOptions({
      onSuccess: () => {
        refetchJumps();
        setIsAddingJump(false);
      }
    })
  );

  const updateJumpMutation = useMutation(
    trpc.jumps.updateJump.mutationOptions({
      onSuccess: () => {
        refetchJumps();
        setEditingJump(null);
      }
    })
  );

  const deleteJumpMutation = useMutation(
    trpc.jumps.deleteJump.mutationOptions({
      onSuccess: () => refetchJumps()
    })
  );

  const newJumpForm = useForm<z.infer<typeof jumpSchema>>({
    resolver: zodResolver(jumpSchema),
    defaultValues: {
      trigger: "0:00.0",
      target: "0:00.0",
      description: "",
    },
  });

  const editJumpForm = useForm<z.infer<typeof jumpSchema>>({
    resolver: zodResolver(jumpSchema),
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
  }, [isAddingJump, newJumpForm]);

  // Set form values when editing
  useEffect(() => {
    if (editingJump !== null && jumps) {
      const jump = jumps.find(j => j.id === editingJump);
      if (jump) {
        editJumpForm.reset({
          trigger: formatTime(jump.trigger),
          target: formatTime(jump.target),
          description: jump.description || "",
        });
      }
    }
  }, [editingJump, jumps, editJumpForm]);

  // Format duration
  const minutes = Math.floor(track.duration_ms / 60000);
  const seconds = Math.floor((track.duration_ms % 60000) / 1000);
  const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const onAddJump = (data: z.infer<typeof jumpSchema>) => {
    addJumpMutation.mutate({
      songId: track.id,
      trigger: parseTime(data.trigger),
      target: parseTime(data.target),
      description: data.description,
    });
  };

  const onUpdateJump = (data: z.infer<typeof jumpSchema>) => {
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Track Details</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </Button>
        </div>

        <div className="flex flex-col items-center">
          {track.album.images && track.album.images[0]?.url && (
            <div className="relative w-48 h-48 mb-4">
              <Image
                src={track.album.images[0].url}
                alt={track.name}
                fill
                className="object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          <h2 className="text-xl font-bold text-center mb-1">{track.name}</h2>
          <p className="text-gray-400 text-center mb-4">
            {track.artists.map((artist) => artist.name).join(", ")}
          </p>

          <div className="grid grid-cols-2 gap-4 w-full mb-4">
            <div className="bg-gray-700 p-2 rounded text-center">
              <p className="text-xs text-gray-400">Album</p>
              <p className="truncate">{track.album.name}</p>
            </div>
            <div className="bg-gray-700 p-2 rounded text-center">
              <p className="text-xs text-gray-400">Duration</p>
              <p>{formattedDuration}</p>
            </div>
          </div>

          <Link href={track.external_urls.spotify} target="_blank">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full transition mb-6">
              Play on Spotify
            </button>
          </Link>

          {/* Song Jumps Section */}
          <div className="w-full border-t border-gray-700 pt-6 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Song Jumps</h3>
              {!isAddingJump && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setIsAddingJump(true)}
                  className="text-xs"
                >
                  <Plus size={14} className="mr-1" /> Add Jump
                </Button>
              )}
            </div>

            {isAddingJump && (
              <div className="mb-4 bg-gray-700 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">New Jump</h4>
                <Form {...newJumpForm}>
                  <form onSubmit={newJumpForm.handleSubmit(onAddJump)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={newJumpForm.control}
                        name="trigger"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Trigger (M:SS.S)</FormLabel>
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
                            <FormLabel className="text-xs">Target (M:SS.S)</FormLabel>
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
                          <FormLabel className="text-xs">Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Description (optional)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setIsAddingJump(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">Save</Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {jumps && jumps.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Trigger</TableHead>
                    <TableHead className="w-[80px]">Target</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jumps.map((jump) => (
                    <TableRow key={jump.id}>
                      {editingJump === jump.id ? (
                        <TableCell colSpan={4}>
                          <Form {...editJumpForm}>
                            <form onSubmit={editJumpForm.handleSubmit(onUpdateJump)} className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <FormField
                                  control={editJumpForm.control}
                                  name="trigger"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Trigger (M:SS.S)</FormLabel>
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
                                      <FormLabel className="text-xs">Target (M:SS.S)</FormLabel>
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
                                    <FormLabel className="text-xs">Description</FormLabel>
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
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setEditingJump(null)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" size="sm">Update</Button>
                              </div>
                            </form>
                          </Form>
                        </TableCell>
                      ) : (
                        <>
                          <TableCell>{formatTime(jump.trigger)}</TableCell>
                          <TableCell>{formatTime(jump.target)}</TableCell>
                          <TableCell>{jump.description || '-'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setEditingJump(jump.id)}
                                className="h-7 w-7"
                              >
                                <Edit size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onDeleteJump(jump.id)}
                                className="h-7 w-7 text-red-500 hover:text-red-400"
                              >
                                <Trash size={14} />
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
              <div className="text-center py-8 text-gray-400">
                <p>No jumps configured for this track.</p>
                <p className="text-sm mt-1">Add a jump to skip or repeat sections.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 