import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartState, CartService } from "./cart.types";

const initialState: CartState = {
    service: null,
    isLoading: false,
    error: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addServiceToCart: (state, action: PayloadAction<CartService>) => {
            state.service = action.payload;
            state.error = null;
        },
        removeServiceFromCart: (state) => {
            state.service = null;
            state.error = null;
        },
        clearCart: (state) => {
            state.service = null;
            state.error = null;
        },
        setCartError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        clearCartError: (state) => {
            state.error = null;
        },
    },
});

export const {
    addServiceToCart,
    removeServiceFromCart,
    clearCart,
    setCartError,
    clearCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
