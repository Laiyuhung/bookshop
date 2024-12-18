import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import UsersPage from "../pages/UsersPage";
import StorePage from "../pages/StorePage";
import DetailsPage from "../pages/DetailsPage";
import ProfilePage from "../pages/ProfilePage";
import OrdersPage from "../pages/OrdersPage";
import MyCouponsPage from "../pages/MyCouponsPage";
import MemberManagementPage from "../pages/MemberManagementPage";
import OrdersManagementPage from "../pages/OrdersManagementPage"; // 新增訂單管理頁面
import ProtectedRoutes from "../pages/ProtectedRoutes";
import CouponsManagementPage from "../pages/CouponsManagementPage";
import BookManagementPage from "../pages/BookManagementPage";
import RevenueAnalysisPage from "../pages/RevenueAnalysisPage";
import RevenueForPersonal from "../pages/RevenueForPersonal";

function BookstoreRoutes() {
    const location = useLocation();

    return (
        <Routes location={location} key={location.pathname}>
            {/* 公開路由 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/books" element={<StorePage />} />
            <Route path="/books/:slug" element={<DetailsPage />} />
            <Route path="/manage-books" element={<BookManagementPage />} />
            <Route path="/admin/revenues" element={<RevenueAnalysisPage />} />
            <Route path="/vendor/revenue" element={<RevenueForPersonal />} />


            {/* 保護路由 */}
            <Route element={<ProtectedRoutes />}>
                {/* 使用者專屬 */}
                <Route path="/users" element={<UsersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/coupons" element={<MyCouponsPage />} />

                {/* 管理員專屬 */}
                <Route path="/admin/members" element={<MemberManagementPage />} />
                <Route path="/admin/orders" element={<OrdersManagementPage />} />
                <Route path="/admin/coupons" element={<CouponsManagementPage />} />
            </Route>

            {/* 404 頁面 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default BookstoreRoutes;
