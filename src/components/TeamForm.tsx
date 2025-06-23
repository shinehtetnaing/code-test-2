import { teamSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Team } from "./TeamList";
import { DialogClose } from "./ui/dialog";

type TeamFormProps = {
  onSuccess?: () => void;
  team?: z.infer<typeof teamSchema>;
};

const TeamForm = ({ onSuccess, team }: TeamFormProps) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name || "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof teamSchema>) => {
      const stored = localStorage.getItem("teams");
      const teams = stored ? JSON.parse(stored) : [];

      if (team) {
        const isRenaming =
          values.name.toLowerCase() !== team.name.toLowerCase();

        if (isRenaming) {
          const isDuplicate = teams.some(
            (t: Team) => t.name.toLowerCase() === values.name.toLowerCase()
          );
          if (isDuplicate) {
            form.setError("name", {
              message: "Team name must be unique",
            });
            return;
          }
        }

        const updatedTeams = teams.map((t: Team) =>
          t.name === team.name ? values : t
        );
        localStorage.setItem("teams", JSON.stringify(updatedTeams));
      } else {
        const isDuplicate = teams.some(
          (team: Team) => team.name.toLowerCase() === values.name.toLowerCase()
        );
        if (isDuplicate) {
          form.setError("name", {
            type: "manual",
            message: "Team name must be unique",
          });
          return;
        }

        const updatedTeams = [...teams, values];
        localStorage.setItem("teams", JSON.stringify(updatedTeams));
      }

      form.reset();
      onSuccess?.();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () => {},
  });

  function onSubmit(values: z.infer<typeof teamSchema>) {
    mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter team name" {...field} />
              </FormControl>
              <FormDescription>This is your team name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3 mb-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? team
                ? "Updating..."
                : "Submitting..."
              : team
              ? "Update"
              : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TeamForm;
