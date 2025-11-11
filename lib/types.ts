import type { Database } from "@/lib/database.types";

export type Entry = Database["public"]["Tables"]["entries"]["Row"];
export type NewEntry = Database["public"]["Tables"]["entries"]["Insert"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type NewComment = Database["public"]["Tables"]["comments"]["Insert"];
