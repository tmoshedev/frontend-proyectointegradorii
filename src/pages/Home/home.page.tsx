import { useMemo } from "react";
/* Pages */
import DefaultHomePage from "./pages/default-home";
import DashboardHomePage from "./pages/dashboard-home";

export const HomePage = () => {
  const currentPage = useMemo(() => {
    const roles = localStorage.getItem("roles");
    const rolesArray = roles ? JSON.parse(roles) : [];

    if (rolesArray.length !== 1) return DefaultHomePage;

    const roleCode = rolesArray[0];
    
    switch (roleCode) {
      case "DEVELOPER":
      case "ADMINISTRATOR":
        return DashboardHomePage;
      default:
        return DefaultHomePage;
    }
  }, []);

  return currentPage();
};

export default HomePage;