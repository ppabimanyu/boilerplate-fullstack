import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "./home-page";
import { Layout } from "./layout";
import { NotFoundPage } from "./not-found-page";
import { RouteFallback } from "./route-fallback";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    HydrateFallback: RouteFallback,
    children: [
      { index: true, element: <HomePage /> },
      ...(import.meta.env.DEV
        ? [
            {
              path: "_gallery",
              lazy: () =>
                import("./gallery-page").then((module) => ({
                  Component: module.GalleryPage,
                })),
            },
          ]
        : []),
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
