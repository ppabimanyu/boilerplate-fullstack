import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "./home-page";
import { Layout } from "./layout";
import { NotFoundPage } from "./not-found-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
