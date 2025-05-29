import { createBrowserRouter } from "react-router-dom";

import Layout from "@/layout/layout";

import Login from "@/components/login/login";
import Landing from "@/components/landing/landing";
import PasswordRecovery from "@/components/password-recovery/password-recovery";
import RestorePassword from "@/components/password-recovery/restore-password";
import SignUp from "@/components/sign-up/sign-up";
import TrainerProfile from "@/components/trainer-profile/trainer-profile";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        index: true,
        element: (
          <Layout showHeader={true} showFooter={true}>
            <Landing />
          </Layout>
        ),
      },
      {
        path: "login",
        element: (
          <Layout showHeader={false} showFooter={true}>
            <Login />
          </Layout>
        ),
      },
      {
        path: "sign-up",
        element: (
          <Layout showHeader={false} showFooter={true}>
            <SignUp />
          </Layout>
        ),
      },
      {
        path: "password-recovery",
        element: (
          <Layout showHeader={false} showFooter={true}>
            <PasswordRecovery />
          </Layout>
        ),
      },
      {
        path: "restore-password",
        element: (
          <Layout showHeader={false} showFooter={true}>
            <RestorePassword />
          </Layout>
        ),
      },
      {
        path: "trainer-profile/:id",
        element: (
          <Layout showHeader={true} showFooter={true}>
            <TrainerProfile />
          </Layout>
        ),
      },
    ],
  },
]);

export default router;
