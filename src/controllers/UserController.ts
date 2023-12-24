// src/controllers/UserController.ts
import { Context } from "https://deno.land/x/oak/mod.ts";
import User, {createUser, fetchAll, updateUser, findByID} from "../models/User.ts";
import {database} from '../config/database.ts';

class UserController {
  static async getAll(ctx: Context) {
    const users = await fetchAll();
    ctx.response.body = users;
  }

  static async getById(ctx: Context) {
    const userId = ctx.params.id;
    const user = await findByID({ id: userId });
    console.log(user)

    if (user) {
      ctx.response.body = user;
    } else {
      ctx.response.status = 404;
      ctx.response.body = { message: "User not found" };
    }
  }

  static async create(ctx: Context) {
    try {
      const data = await ctx.request.body({ type: "json" });
      const requestBody = await data.value;
      console.log(requestBody)
      const newUser: User = {
        fullname: requestBody.fullname,
        email: requestBody.email,
        mobile: requestBody.mobile,
        address: requestBody.address,
        designation: requestBody.designation,
      };
      const store = await createUser(newUser);
  
      console.log(`Inserted ${store} rows`);
  
      ctx.response.body = { message: "Created User!", User: newUser };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid request format" };
    }
  }

  static async update(ctx: Context) {
    try {
      const { id } = ctx.params;
      const data = await ctx.request.body({ type: "json" });
      const requestBody = await data.value;
      const newUser: User = {
        fullname: requestBody.fullname,
        email: requestBody.email,
        mobile: requestBody.mobile,
        address: requestBody.address,
        designation: requestBody.designation,
      };
      const store = await updateUser(newUser);
  
      console.log(`Updated ${store} rows`);
  
      ctx.response.body = { message: "Updated User!", User: newUser };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid request format" };
    }
  }

  static async delete(ctx: Context) {
    const userId = ctx.params.id;
    const user = await User.findOne({ id: userId });
    if (user) {
      await user.delete();
      ctx.response.body = { message: "User deleted successfully" };
    } else {
      ctx.response.status = 404;
      ctx.response.body = { message: "User not found" };
    }
  }
}

export default UserController;
