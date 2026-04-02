import type { RouteObject } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import HomePage from "../pages/HomePage";
import KISPage from "../pages/KISPage";
import KIFAssessmentPage from "../pages/KIFAssessmentPage";
import CaseworkerPage from "../pages/CaseworkerPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "kisagsbehandler",
        element: <KISPage />,
      },
      {
        path: "ansoegning",
        element: <KIFAssessmentPage />,
      },
      {
        path: "sagsbehandler",
        element: <CaseworkerPage />,
      },
    ],
  },
];
