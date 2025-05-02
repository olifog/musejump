import "server-only";
import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import {
	type TRPCQueryOptions,
	createTRPCOptionsProxy,
} from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

export const getQueryClient = cache(makeQueryClient);
export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{props.children}
		</HydrationBoundary>
	);
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
	queryOptions: T,
) {
	const queryClient = getQueryClient();
	if (queryOptions.queryKey[1]?.type === "infinite") {
		void queryClient.prefetchInfiniteQuery(queryOptions as any);
	} else {
		void queryClient.prefetchQuery(queryOptions);
	}
}
