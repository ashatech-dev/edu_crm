import "dotenv/config";
import "reflect-metadata";

import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDB } from "./shared/config/db";
import { setupSwagger } from "./shared/config/swagger";
// import { streamToElastic } from "./shared/utils/logger";
// import { oauthMiddleware } from "./features/auth/oauthMiddleware";
import { loggerMiddleware } from "./shared/middlewares/logger.middleware";
import RequestLogger from "./shared/middlewares/request_logger.middleware";
import { errorHandler } from "./shared/middlewares/error.middleware";

import { AuthRouter } from "./features/auth/auth.route";
import { ProductRouter } from "./features/product/products.route";
import CategoryRouter from "./features/category/category.route";
import { ReviewRouter } from "./features/review/review.route";
import { CartRouter } from "./features/cart/cart.route";
import { AddressRouter } from "./features/address/address.route";
import { OrderRouter } from "./features/order/orders.route";
import { imagesRouter } from "./features/uploads/upload.route";
import { UsersRouter } from "./features/users/user.route";
import { WishlistRouter } from "./features/wishlist/wishlist.route";

const WHITELIST_DOMAINS = process.env.CORS_WHITELIST?.split(",");

const app: Express = express();
const PORT = process.env.PORT || 8000;

const limiter = rateLimit({
  windowMs: 15 * 60_1000,
  max: process.env.NODE_ENV === "development" ? Infinity : 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// all the middlewares
app.use(helmet());
app.use(limiter);
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: WHITELIST_DOMAINS,
    credentials: true,
  })
);
app.use(RequestLogger);
app.use(loggerMiddleware);
setupSwagger(app);


// app.get(
//   "/",
//   oauthMiddleware,
//   function (_: express.Request, res: express.Response) {
//     res.send({ message: "Welcome to Wingfi Apis!" });
//   }
// );

app.use("/auth", AuthRouter);
app.use("/users", UsersRouter);
app.use("/categories", CategoryRouter);
app.use("/products", ProductRouter);
app.use("/reviews", ReviewRouter);
app.use("/images", imagesRouter);
app.use("/cart", CartRouter);
app.use("/address", AddressRouter);
app.use("/orders", OrderRouter);
app.use("/wishlist", WishlistRouter);

// do not touch this! as error middleware will be in the end of all the routes!
app.use(errorHandler);

let server;

async function startServer() {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    // streamToElastic._flush((error) => {
    //   console.log(error);
    // });
    process.exit(1);
  }
}

if (import.meta.url === new URL(import.meta.url, import.meta.url).href) {
  startServer();
}

export { app, startServer, server };
