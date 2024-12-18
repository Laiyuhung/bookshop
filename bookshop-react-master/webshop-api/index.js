const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const port = 3001;

// 引入各個路由
const usersRouter = require("./routes/users");
const booksRouter = require("./routes/books");
const ordersRouter = require("./routes/orders");
const authRouter = require("./routes/auth");
const cartRouter = require("./routes/cart");
const couponsRouter = require("./routes/coupons"); // 新增 coupons 路由
const categoriesRouter = require("./routes/categories"); // 引入新路由檔案
const administratorRouter = require("./routes/administrator");
const vendorRouter = require("./routes/vendors");
const revenuesRouter = require("./routes/revenues");

const app = express();

// 設置視圖引擎
app.set("views", path.join(__dirname, "views"));

// 中介軟體配置
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 註冊路由
app.use("/users", usersRouter);
app.use("/books", booksRouter);
app.use("/orders", ordersRouter);
app.use("/auth", authRouter);
app.use("/cart", cartRouter);
app.use("/coupons", couponsRouter); // 註冊 coupons 路由
app.use("/categories", categoriesRouter); // 設定路由的基礎路徑
app.use("/administrators", administratorRouter);
app.use("/vendors", vendorRouter);
app.use("/revenues", revenuesRouter);


// 處理 404 錯誤
app.use((req, res, next) => {
    next(createError(404));
});

// 全局錯誤處理
app.use((err, req, res, next) => {
    console.error(err.stack); // 打印錯誤堆疊
    res.status(err.status || 500).send({
        message: err.message || "Internal Server Error",
        status: err.status || 500,
    });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
