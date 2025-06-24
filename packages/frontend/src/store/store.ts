import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./profile/profile.slice";
import authReducer from "./auth/auth.slice";
import servicesReducer from "./services/services.slice";
import trainerReducer from "./trainer/trainer.slice";
import trainerEvaluationsReducer from "./trainer-evaluations/trainer-evaluations.slice";
import cartReducer from "./cart/cart.slice";

export const store = configureStore({
    reducer: {
        profile: profileReducer,
        auth: authReducer,
        services: servicesReducer,
        trainer: trainerReducer,
        trainerEvaluations: trainerEvaluationsReducer,
        cart: cartReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
