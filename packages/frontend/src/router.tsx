import { createBrowserRouter } from "react-router-dom"

import Landing from "@/components/lading/landing"
import Login from "@/components/login/login"

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
])

export default router
