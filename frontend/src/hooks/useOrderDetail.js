// src/hooks/useOrderDetail.js
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

export const useOrderDetail = (id) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id, // chỉ fetch khi có id
  });
};
