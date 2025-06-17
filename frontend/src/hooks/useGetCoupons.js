// src/hooks/useGetCoupons.js
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

const fetchCoupons = async () => {
  const res = await api.get("/coupons");
  return res.data;
};

export const useGetCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: fetchCoupons,
  });
};
