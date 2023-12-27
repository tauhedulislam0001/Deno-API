import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import UserController from "../controllers/UserController.ts";
import * as UserJWTController from "../controllers/UserJWTController.ts";

  const router = new Router();

  // Define routes
  router.get("/api/users", UserController.getAll);
  router.get("/api/user/:id", UserController.getById);
  router.post("/api/user/create", UserController.create);
  router.put("/api/user/update/:id", UserController.update);
  router.delete("/api/user/delete/:id", UserController.delete);

  router.post("/api/user/login", UserJWTController.Login);
export default router;
