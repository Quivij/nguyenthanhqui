import { useMutation } from "@tanstack/react-query";

export const useMutationHook = (mutationFn, options = {}) => {
  return useMutation({
    mutationFn,
    ...options,
  });
};
