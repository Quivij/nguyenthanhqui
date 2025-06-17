import { useMutation } from "@tanstack/react-query";
import api from "../api/api";

export const validateCoupon = async ({ code, orderTotal }) => {
  try {
    // console.log("Sending validation request:", { code, orderTotal }); // Debug log
    const res = await api.post("/coupons/validate", { code, orderTotal });
    // console.log("Validation response:", res.data); // Debug log
    return res.data;
  } catch (error) {
    // console.error("Validation error:", error); // Debug log
    throw error.response?.data || error;
  }
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: validateCoupon,
  });
};

