import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./profile/profile.slice";
import authReducer from "./auth/auth.slice";
import servicesReducer from "./services/services.slice";

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    auth: authReducer,
    services: servicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
