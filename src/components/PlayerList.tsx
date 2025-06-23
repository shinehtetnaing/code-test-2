import axiosInstance from "@/api/axiosInstance";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import AddPlayerToTeamDialog from "./AddPlayerToTeamDialog";
import type { Team } from "./TeamList";
import { Button } from "./ui/button";

export type Player = {
  id: number;
  first_name: string;
  last_name: string;
};

type APIResponse = {
  data: Player[];
  meta: {
    next_cursor: number;
    per_page: number;
  };
};

const fetchPlayers = async ({
  pageParam,
}: {
  pageParam: number;
}): Promise<APIResponse> => {
  const res = await axiosInstance.get("/v1/players", {
    params: {
      per_page: 10,
      page: pageParam,
    },
  });
  return res.data;
};

export default function PlayerList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["players"],
      queryFn: ({ pageParam = 1 }) => fetchPlayers({ pageParam }),
      initialPageParam: 1,
      //   getNextPageParam: (lastPage) => lastPage.meta.next_cursor,
      getNextPageParam: (lastPage, allPages) => {
        // if less than per_page items were returned, it means no more data
        const hasMore = lastPage.data.length === lastPage.meta.per_page;
        return hasMore ? allPages.length + 1 : undefined;
      },
    });

  const observerRef = useRef<HTMLDivElement | null>(null);

  const queryClient = useQueryClient();

  const {
    data: teams = [],
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const stored = localStorage.getItem("teams");
      return stored ? JSON.parse(stored) : [];
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (playerId: number) => {
      const updatedTeams = teams.map((team: Team) => ({
        ...team,
        playerIds: team.playerIds?.filter((id) => id !== playerId) || [],
      }));

      localStorage.setItem("teams", JSON.stringify(updatedTeams));

      return updatedTeams;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="space-y-4 max-w-xl w-full">
      {status === "pending" && (
        <p className="text-center">Loading players...</p>
      )}
      {status === "error" && (
        <p className="text-center text-red-500">Failed to load players</p>
      )}

      {data?.pages.map((page) =>
        page.data.map((player) => {
          const team = teams.find((t: Team) =>
            t.playerIds?.includes(player.id)
          );

          return (
            <div
              key={player.id}
              className="bg-white flex justify-between rounded-xl shadow p-4 border border-gray-200"
            >
              <div className="space-y-3">
                <p className="font-bold">
                  {player.first_name} {player.last_name}
                </p>
                {team && (
                  <p className="text-lg text-gray-500">
                    Team:{" "}
                    <span className="font-semibold capitalize">
                      {team.name}
                    </span>
                  </p>
                )}
              </div>
              {team ? (
                <Button
                  variant="destructive"
                  onClick={() => {
                    mutate(player.id);
                  }}
                  disabled={isPending}
                >
                  Remove Player from Team
                </Button>
              ) : (
                <AddPlayerToTeamDialog
                  player={player}
                  teams={teams}
                  isError={isError}
                  isLoading={isLoading}
                />
              )}
            </div>
          );
        })
      )}

      <div ref={observerRef} className="h-12" />
      {isFetchingNextPage && <p className="text-center">Loading more...</p>}
    </div>
  );
}
