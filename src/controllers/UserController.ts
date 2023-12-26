// src/controllers/UserController.ts
import { Context } from "https://deno.land/x/oak/mod.ts";
import User, {createUser, fetchAll, updateUser, findByID, deleteByID} from "../models/User.ts";
import {database} from '../config/database.ts';

class UserController {
  static async getAll(ctx: Context) {
    const users = await fetchAll();
    ctx.response.body = users;
  }

  static async getById(ctx: Context) {
    const userId = ctx.params.id;
    const user = await findByID(userId);

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
      
      if(requestBody.password != requestBody.confirm_password) {
        console.log("password and confirm password does not match")
        ctx.response.body = { message: "password and confirm password does not match!", User: {} };
      } else {
        console.log("password match")

        const newUser: User = {
          fullname: requestBody.fullname,
          email: requestBody.email,
          password: requestBody.password,
          mobile: requestBody.mobile,
          address: requestBody.address,
          date_of_birth: requestBody.date_of_birth,
          status: 1,
          can_login: 1,
          designation: requestBody.designation,
        };
        console.log(newUser)
        const store = await createUser(newUser);
        console.log(store)
  
        console.log(`Inserted ${store} rows`);
    
        ctx.response.body = { message: "Created User!", User: newUser };
      }
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
        id:id,
        fullname: requestBody.fullname,
        email: requestBody.email,
        mobile: requestBody.mobile,
        address: requestBody.address,
        date_of_birth: requestBody.date_of_birth,
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
    const user = await deleteByID(userId);
    console.log(`Deleted ${user} rows`);

    if (user > 0) {
        ctx.response.body = { message: "Deleted user!" };
    } else {
        ctx.response.body = { message: "User not found" };
    }
  }
}

export default UserController;
