import type { Database, UserRole } from "./database.types";

export type { UserRole };
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface ProfileWithDepartment extends Profile {
  department: Database["public"]["Tables"]["departments"]["Row"] | null;
}
