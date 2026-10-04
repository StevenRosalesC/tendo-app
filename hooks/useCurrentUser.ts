import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import tendoApi from "../services/api";
import useAuthStore from "../stores/useAuthStore";
import { AuthenticatedUserProfile } from "../types/auth.types";

export function useCurrentUser() {
  const { getToken, isSignedIn } = useAuth();
  const { setUser, clearUser, user: cachedUser } = useAuthStore();

  const query = useQuery<AuthenticatedUserProfile>({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("No active Clerk session token available");
      }
      return tendoApi.getProfile(token);
    },
    enabled: !!isSignedIn,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    } else if (!isSignedIn) {
      clearUser();
    }
  }, [query.data, isSignedIn]);

  return {
    ...query,
    user: query.data || cachedUser,
  };
}

export default useCurrentUser;
