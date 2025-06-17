// src/hooks/useMyOrders.js
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

export const useMyOrders = () => {
  return useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const { data } = await api.get("/orders/my");
      return data;
    },
  });
};
