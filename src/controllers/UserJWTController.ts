import {Application,Context,RouterContext,Status,} from "https://deno.land/x/oak/mod.ts";
import database from "../config/database.ts";
import { User } from "../models/User.ts";
import { create } from "https://deno.land/x/djwt@v2.4/mod.ts";
import User, {findByMobile} from "../models/User.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { signJwt, verifyJwt,ACCESS_TOKEN_EXPIRES_IN,REFRESH_TOKEN_EXPIRES_IN } from "../helper/jwt.ts";

export const Login = async (ctx) => {
  try {
    const data = await ctx.request.body({ type: "json" });
    const requestBody = await data.value;
    const mobile = requestBody.mobile;
    const password = requestBody.password;
    console.log(mobile)
    const userData = await findByMobile("users", mobile);

    if (!userData || userData.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { message: `User not found` };
      return;
    }
    const user = userData[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Incorrect password" };
      return;
    }
    const payload = {
      id: user.id,
      mobile: mobile,
    };
    const accessTokenExpiresIn = new Date(
      Date.now() + ACCESS_TOKEN_EXPIRES_IN * 60 * 1000,
    );
    const refreshTokenExpiresIn = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES_IN * 60 * 1000,
    );

    const { token: access_token } = await signJwt({
      user_id: user.id,
      privateKeyPem: "ACCESS_TOKEN_PRIVATE_KEY",
      expiresIn: accessTokenExpiresIn,
      issuer: "website.com",
    });
    const { token: refresh_token } = await signJwt({
      user_id: user.id,
      privateKeyPem: "REFRESH_TOKEN_PRIVATE_KEY",
      expiresIn: refreshTokenExpiresIn,
      issuer: "website.com",
    });
    // const jwt = await create({ alg: "HS512", typ: "JWT" }, { payload }, key);
    if (access_token) {
      ctx.response.status = 200;
      ctx.response.body = {
        userId: user.id,
        name: user.name,
        mobile: user.mobile,
        token: access_token,
      };
    } else {
      ctx.response.status = 500;
      ctx.response.body = {
        message: "internal server error",
      };
    }
    return;
  } catch (error) {
    console.log(error);

    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid request format" };
  }
};

const refreshAccessTokenController = async ({response,cookies}: RouterContext<string>) => {
  try {
    const refresh_token = await cookies.get("refresh_token");

    const message = "Could not refresh access token";

    if (!refresh_token) {
      response.status = 403;
      response.body = {
        status: "fail",
        message,
      };
      return;
    }

    const decoded = await verifyJwt<{ sub: string }>({
      token: refresh_token,
      publicKeyPem: "REFRESH_TOKEN_PUBLIC_KEY",
    });

    if (!decoded) {
      response.status = 403;
      response.body = {
        status: "fail",
        message,
      };
      return;
    }

    const accessTokenExpiresIn = new Date(
      Date.now() + ACCESS_TOKEN_EXPIRES_IN * 60 * 1000,
    );

    const { token: access_token } = await signJwt({
      user_id: decoded.sub,
      issuer: "website.com",
      privateKeyPem: "ACCESS_TOKEN_PRIVATE_KEY",
      expiresIn: accessTokenExpiresIn,
    });

    response.status = 200;
    response.body = { status: "success", access_token };
  } catch (error) {
    response.status = 500;
    response.body = { status: "error", message: error.message };
    return;
  }
};