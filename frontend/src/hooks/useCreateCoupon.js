// src/hooks/useCreateCoupon.js
import { useMutation } from "@tanstack/react-query";
import api from "../api/api"; // axios instance đã cấu hình sẵn

const createCoupon = async (form) => {
  const res = await api.post("/coupons", form);
  return res.data;
};

export const useCreateCoupon = () => {
  return useMutation({
    mutationFn: createCoupon,
  });
};
