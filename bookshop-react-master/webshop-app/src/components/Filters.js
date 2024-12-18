import React, { useState, useEffect } from "react";
import { BASE_URL } from "../Constants";

function Filters({ filters, setFilters, fetchBooks }) {
    const [categories, setCategories] = useState([]); // 儲存分類數據

    // 獲取書籍分類選項
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${BASE_URL}/categories`);
                if (!response.ok) throw new Error("無法獲取分類資料");
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    // 處理分類勾選
    const handleCheckboxChange = (e) => {
        const isChecked = e.target.checked;
        const categoryValue = e.target.value;

        setFilters((prevFilters) => ({
            ...prevFilters,
            category: isChecked
                ? [...prevFilters.category, categoryValue]
                : prevFilters.category.filter((cat) => cat !== categoryValue),
        }));

        fetchBooks(); // 更新書籍列表
    };

    // 處理重設篩選
    const handleResetFilters = () => {
        setFilters({ category: [], search: "" });
        fetchBooks(); // 重置後更新書籍列表
    };

    return null; // 不渲染任何內容
}

export default Filters;
