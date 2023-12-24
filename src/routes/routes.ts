import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import UserController from "../controllers/UserController.ts";

  const router = new Router();

  // Define routes
  router.get("/api/users", UserController.getAll);
  router.get("/api/user/:id", UserController.getById);
  router.post("/api/user/create", UserController.create);
  router.put("/api/user/update/:id", UserController.update);
  router.delete("/api/users/:id", UserController.delete);

export default router;
