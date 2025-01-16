-- SQLBook: Code
CREATE TABLE MEMBER (
    Member_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(255),
    Phone VARCHAR(20),
    Birthday DATE,
    Last_login TIMESTAMP,
    Register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status INT DEFAULT 1
);


-- SQLBook: Code
CREATE TABLE MEMBER (
    Member_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(255),
    Last_login TIMESTAMP,
    Register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status INT DEFAULT 1
);

CREATE TABLE DETAIL_MEMBER (
    Member_ID INT PRIMARY KEY,
    Phone VARCHAR(20),
    Birthday DATE,
    FOREIGN KEY (Member_ID) REFERENCES MEMBER(Member_ID)
);
-- SQLBook: Code
CREATE INDEX idx_order_product_quantity_price 
    ON ORDER_PRODUCT (Order_ID, Product_ID, Quantity, Price);

    