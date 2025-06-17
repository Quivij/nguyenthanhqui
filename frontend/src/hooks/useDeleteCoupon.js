// src/hooks/useDeleteCoupon.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

const deleteCoupon = async (id) => {
  const res = await api.delete(`/coupons/${id}`);
  return res.data;
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries(["coupons"]); // refetch danh sách
    },
  });
};
