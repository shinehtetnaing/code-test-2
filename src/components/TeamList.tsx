import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import TeamForm from "./TeamForm";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export type Team = {
  name: string;
  playerIds?: number[];
};

const TeamList = () => {
  const [open, setOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | undefined>(undefined);
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

  const { mutate: removeTeam } = useMutation({
    mutationFn: async (teamName: string) => {
      const stored = localStorage.getItem("teams");
      const teams = stored ? JSON.parse(stored) : [];
      const updated = teams.filter((team: Team) => team.name !== teamName);
      localStorage.setItem("teams", JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading teams.</p>;

  return (
    <div className="space-y-4 max-w-lg">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            onClick={() => {
              setEditTeam(undefined);
              setOpen(true);
            }}
          >
            Create Team
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editTeam ? "Edit Team" : "Create Team"}</DialogTitle>
            <DialogDescription>
              {editTeam
                ? "Update the team details below."
                : "Create a new team by filling out the form below."}
            </DialogDescription>
          </DialogHeader>
          <TeamForm onSuccess={() => setOpen(false)} team={editTeam} />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : teams.length === 0 ? (
          <p className="text-muted-foreground">No teams created yet.</p>
        ) : (
          teams.map((team: Team) => (
            <Card
              key={team.name}
              className="flex items-center justify-between p-4 shadow-sm"
            >
              <div>
                <h4 className="font-semibold text-lg capitalize">
                  {team.name}
                </h4>
                <p className="text-sm text-muted-foreground">Team entry</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditTeam(team);
                    setOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTeam(team.name)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamList;
