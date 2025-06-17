// src/hooks/useFetchProfile.js
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "../api/auth";

export const useFetchProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });
};
