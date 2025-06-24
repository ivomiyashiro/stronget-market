import { useSelector } from "react-redux";
import type { RootState } from "../store";

export const useCart = () => {
    return useSelector((state: RootState) => state.cart);
};

export const useCartService = () => {
    return useSelector((state: RootState) => state.cart.service);
};

export const useCartLoading = () => {
    return useSelector((state: RootState) => state.cart.isLoading);
};

export const useCartError = () => {
    return useSelector((state: RootState) => state.cart.error);
};
