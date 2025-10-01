import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { CurrentUserSnapshot } from "../types";

const mapUser = (user: User, role?: string) => ({
  id: user.id,
  email: user.email,
  appMetadata: user.app_metadata ?? {},
  userMetadata: user.user_metadata ?? {},
  role: role ?? null,
});

export const loadCurrentUser = async (): Promise<CurrentUserSnapshot> => {
  const supabase = await createSupabaseServerClient();
  const result = await supabase.auth.getUser();
  const user = result.data.user;

  if (user) {
    // profiles 테이블에서 role 정보 가져오기
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return {
      status: "authenticated",
      user: mapUser(user, profile?.role),
    };
  }

  return { status: "unauthenticated", user: null };
};
