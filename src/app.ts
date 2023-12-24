// src/app.ts
import { Application } from "https://deno.land/x/oak/mod.ts";
import UserController from "./controllers/UserController.ts";
import User from "./models/User.ts";
import Router from "./routes/routes.ts";
import client from "./config/database.ts";

const app = new Application();
const PORT = 8000;

// Middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal Server Error" };
    console.error(err);
  }
});

app.use(async (ctx, next) => {
  console.log('Middleware!');
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Use the router middleware
app.use(Router.routes());
app.use(Router.allowedMethods());

app.addEventListener("listen", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

await app.listen({ port: PORT });

