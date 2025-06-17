import { useQuery } from "@tanstack/react-query";
import { allProducts } from "../api/product";

export const useProducts = (params) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => allProducts(params),
    keepPreviousData: true, // Giúp giữ lại dữ liệu cũ khi đổi page
  });
};
