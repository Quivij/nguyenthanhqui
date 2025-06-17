// src/hooks/useCreateOrder.js
import { useMutation } from "@tanstack/react-query";
import api from "../api/api";

const createOrder = async (orderData) => {
  const res = await api.post("/orders", orderData);
  // console.log("Order created successfully:", orderData);
  return res.data;
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrder,
  });
};
