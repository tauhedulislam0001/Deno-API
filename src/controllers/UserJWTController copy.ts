// Import necessary modules
import { Context } from "https://deno.land/x/oak/mod.ts";
import { create, getNumericDate, verify } from "https://deno.land/x/djwt/mod.ts";
import User,{ findByEmail } from "../models/User.ts";
import { hash, compare } from "../deps.ts"; 
const secretKey = Deno.env.get("JWT_SECRET_KEY") || "default_secret_key"; 
const issuer = Deno.env.get("JWT_ISSUER") || "default_issuer";

// Function to generate JWT token
// const generateToken = async (user: User): Promise<string> => {
//   const payload = {
//     iss: issuer,
//     sub: user.id.toString(),
//     exp: getNumericDate(new Date().getTime() + 60 * 60 * 1000),
//   };

//   try {
//     const token = await create({ alg: "HS256", typ: "JWT" }, payload, secretKey);
//     console.log('sdfdsf', payload, secretKey, 'end');

//     return token;
//   } catch (error) {
//     console.error("Error generating token:", error);
//     throw error;
//   }
// };

const generateToken = async (user: User): Promise<string> => {
  const payload: Payload = {
    iss: issuer,
    sub: user.id.toString(),
    exp: setExpiration(new Date().getTime() + 60 * 60 * 1000),
  };

  try {
    const header: Jose = {
      alg: "HS256",
      typ: "JWT",
    };

    const token = await makeJwt({ header, payload, key: secretKey });
    console.log('sdfdsf', payload, secretKey, 'end');

    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};


// Login endpoint
export const login = async (ctx: Context) => {
  try {
    const data = await ctx.request.body({ type: "json" });
    const { email, password } = await data.value;
    console.log('data',email, password)
    // Retrieve user from the database by email
    const user = await findByEmail(email);
    console.log('data',user)

    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Invalid credentials" };
      return;
    }

    // Compare the provided password with the hashed password from the database
    console.log(password, user.password) 

    const passwordMatch = await compare(password, user.password);
    console.log(passwordMatch)

    if (!passwordMatch) {
      ctx.response.status = 401;
      ctx.response.body = { message: "password does not match" };
      return;
    }

    // Generate JWT token upon successful login
    const token = generateToken(user);
    console.log('token==================', token)

    ctx.response.body = { message: "Login successful", token, user };
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
};

// Middleware to verify JWT token
// export const verifyToken = async (ctx: Context, next: () => Promise<void>) => {
//   try {
//     const token = ctx.request.headers.get("Authorization")?.split(" ")[1];

//     if (!token) {
//       ctx.response.status = 401;
//       ctx.response.body = { message: "Unauthorized" };
//       return;
//     }

//     const payload = await verify(token, "your_secret_key", "HS256");

//     // Attach user data to the context for subsequent middleware or route handlers
//     ctx.state.user = await getUserById(parseInt(payload.sub));

//     await next();
//   } catch (error) {
//     console.error(error);
//     ctx.response.status = 401;
//     ctx.response.body = { message: "Unauthorized" };
//   }
// };

// Middleware to verify JWT token
const verifyToken = async (ctx: Context, next: () => Promise<void>) => {
  const token = ctx.request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Unauthorized" };
    return;
  }

  try {
    const result = await validateJwt(token, secretKey, { isThrowing: false });
    if (result.isValid) {
      ctx.state.user = await findByUserId(parseInt(result.payload.sub));
      await next();
    } else {
      ctx.response.status = 401;
      ctx.response.body = { message: "Unauthorized" };
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    ctx.response.status = 401;
    ctx.response.body = { message: "Unauthorized" };
  }
};


// Example protected route
export const protectedRoute = async (ctx: Context) => {
  const user = ctx.state.user;
  ctx.response.body = { message: "Protected route", user };
};
