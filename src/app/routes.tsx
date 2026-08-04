import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Comparacoes } from "./pages/Comparacoes";
import { Evolucao } from "./pages/Evolucao";
import { Ranking } from "./pages/Ranking";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "comparacoes", Component: Comparacoes },
      { path: "evolucao", Component: Evolucao },
      { path: "ranking", Component: Ranking },
      { path: "*", Component: NotFound },
    ],
  },
]);
