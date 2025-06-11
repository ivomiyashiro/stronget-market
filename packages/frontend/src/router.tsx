import { createBrowserRouter } from "react-router-dom";

import Layout from "@/layout/layout";

import Login from "@/components/login/login";
import Landing from "@/components/landing/landing";
import PasswordRecovery from "@/components/password-recovery/password-recovery";
import RestorePassword from "@/components/password-recovery/restore-password";
import SignUp from "@/components/sign-up/sign-up";
import CreateService from "@/components/create-service/create-service";
import ServiceExpanded from "@/components/service-expanded/service-expanded";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        index: true,
        element: (
          <Layout showHeader showFooter>
            <Landing />
          </Layout>
        ),
      },
      {
        path: "login",
        element: (
          <Layout showFooter showCentered>
            <Login />
          </Layout>
        ),
      },
      {
        path: "sign-up",
        element: (
          <Layout showFooter showCentered>
            <SignUp />
          </Layout>
        ),
      },
      {
        path: "password-recovery",
        element: (
          <Layout showFooter showCentered>
            <PasswordRecovery />
          </Layout>
        ),
      },
      {
        path: "restore-password",
        element: (
          <Layout showFooter showCentered>
            <RestorePassword />
          </Layout>
        ),
      },
      {
        path: "trainer-profile/:id",
        element: (
          <Layout showHeader showFooter>
            <ServiceExpanded />
          </Layout>
        ),
      },
      {
        path: "create-service",
        element: (
          <Layout showHeader showFooter>
            <CreateService />
          </Layout>
        ),
      },
    ],
  },
]);

export default router;
