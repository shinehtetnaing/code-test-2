import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";

import { addPlayerToTeamSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Player } from "./PlayerList";
import type { Team } from "./TeamList";
import { useState } from "react";

const AddPlayerToTeamDialog = ({
  player,
  teams,
  isError,
  isLoading,
}: {
  player: Player;
  teams: Team[];
  isError: boolean;
  isLoading: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof addPlayerToTeamSchema>>({
    resolver: zodResolver(addPlayerToTeamSchema),
    defaultValues: {
      name: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      playerId,
      values,
    }: {
      playerId: number;
      values: z.infer<typeof addPlayerToTeamSchema>;
    }) => {
      const teamIndex = teams.findIndex((team) => team.name === values.name);
      if (teamIndex === -1) throw new Error("Team not found");

      const updatedTeams = [...teams];
      const team = { ...updatedTeams[teamIndex] };

      team.playerIds = [...(team.playerIds || []), playerId];
      updatedTeams[teamIndex] = team;

      localStorage.setItem("teams", JSON.stringify(updatedTeams));

      return updatedTeams;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setOpen(false);
    },
  });

  function onSubmit(values: z.infer<typeof addPlayerToTeamSchema>) {
    mutate({ playerId: player.id, values });
  }

  return (
    <div className="space-y-4 max-w-lg">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add Player to Team</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Add "{player.first_name} {player.last_name}" to -
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Team</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team to add" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isError && (
                          <SelectItem value="none" disabled>
                            Error loading teams.
                          </SelectItem>
                        )}
                        {isLoading ? (
                          <SelectItem value="none" disabled>
                            Loading...
                          </SelectItem>
                        ) : teams.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No teams created yet.
                          </SelectItem>
                        ) : (
                          teams.map((team: Team) => (
                            <SelectItem value={team.name} key={team.name}>
                              {team.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddPlayerToTeamDialog;
