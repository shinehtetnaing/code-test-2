import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(2).max(50),
  //   playerCount: z.number().min(1).max(15),
  //   region: z.string().min(2).max(50),
  //   country: z.string().min(2).max(50),
});

export const addPlayerToTeamSchema = z.object({
  name: z.string().min(1, { message: "Select team name" }).max(50),
});

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }).max(20),
});
