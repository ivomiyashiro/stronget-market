import { createBrowserRouter } from "react-router-dom";

import Layout from "@/layout/layout";
import ProtectedRoute from "@/components/common/protected-route";
import PublicOnlyRoute from "@/components/common/public-only-route";

import Login from "@/components/login/login";
import Landing from "@/components/landing/landing";
import PasswordRecovery from "@/components/password-recovery/password-recovery";
import RestorePassword from "@/components/password-recovery/restore-password";
import SignUp from "@/components/sign-up/sign-up";
import CreateService from "@/components/create-service/create-service";
import ServiceExpanded from "@/components/service-expanded/service-expanded";
import Profile from "./components/profile/profile";
import ServicesTable from "./components/services-table/services-table";
import CartConfirmationPage from "./components/cart-confirmation/cart-confirmation.page";

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
                    <PublicOnlyRoute>
                        <Layout showFooter showCentered>
                            <Login />
                        </Layout>
                    </PublicOnlyRoute>
                ),
            },
            {
                path: "sign-up",
                element: (
                    <PublicOnlyRoute>
                        <Layout showFooter showCentered>
                            <SignUp />
                        </Layout>
                    </PublicOnlyRoute>
                ),
            },
            {
                path: "password-recovery",
                element: (
                    <PublicOnlyRoute>
                        <Layout showFooter showCentered>
                            <PasswordRecovery />
                        </Layout>
                    </PublicOnlyRoute>
                ),
            },
            {
                path: "restore-password",
                element: (
                    <PublicOnlyRoute>
                        <Layout showFooter showCentered>
                            <RestorePassword />
                        </Layout>
                    </PublicOnlyRoute>
                ),
            },
            {
                path: "service/:id",
                element: (
                    <ProtectedRoute>
                        <Layout showHeader showFooter>
                            <ServiceExpanded />
                        </Layout>
                    </ProtectedRoute>
                ),
            },
            {
                path: "create-service/:id?",
                element: (
                    <ProtectedRoute>
                        <Layout showHeader showFooter>
                            <CreateService />
                        </Layout>
                    </ProtectedRoute>
                ),
            },
            {
                path: "profile/:id",
                element: (
                    <ProtectedRoute>
                        <Layout showHeader showFooter>
                            <Profile />
                        </Layout>
                    </ProtectedRoute>
                ),
            },
            {
                path: "my-services",
                element: (
                    <ProtectedRoute>
                        <Layout showHeader showFooter>
                            <ServicesTable />
                        </Layout>
                    </ProtectedRoute>
                ),
            },
            {
                path: "cart",
                element: (
                    <ProtectedRoute>
                        <Layout showHeader showFooter>
                            <CartConfirmationPage />
                        </Layout>
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

export default router;
