const express = require("express");
const app = express();

// # MIDDLEWARES
const cors = require("cors");
const logger = require("./middlewares/logger");

app.use(logger);
app.use(express.static("public"));
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// # ROUTES
const globalRouter = require("./routers/globalRouter");
const categoryRouter = require("./routers/categoryRouter");
const discountCodeRouter = require("./routers/discountCodeRouter");
/* const orderProductRouter = require("./routers/orderProductRouter"); */
const orderRouter = require("./routers/orderRouter");
const productRouter = require("./routers/productRouter");
app.use(globalRouter);
app.use("/categories", categoryRouter);
app.use("/discount-codes", discountCodeRouter);
/* app.use("/order-product", orderProductRouter); */
app.use("/orders", orderRouter);
app.use("/products", productRouter);

// # ERROR MIDDLEWARES
const errorMiddleware = require("./middlewares/errorHandlers");
app.use(errorMiddleware.error404);
app.use(errorMiddleware.error500);

// # SERVER START
app.listen(process.env.APP_PORT, () => {
  console.log(`Server environment: ${process.env.APP_MODE}`);
  console.log(
    `Server listening on ${process.env.APP_URL}:${process.env.APP_PORT}`,
  );
});
