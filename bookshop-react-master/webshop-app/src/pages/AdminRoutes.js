import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// 檢查是否為管理員
function AdminRoutes() {
    const userRole = localStorage.getItem("user_role");
    const isAdmin = userRole === "admin";

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default AdminRoutes;
