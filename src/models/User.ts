// src/models/User.ts
import database from "../config/database.ts"
import { hash } from "https://deno.land/x/bcrypt/mod.ts";


class User {
  id!: number;
  fullname!: string;
  email!: string;
  password!: string;
  mobile!: string;
  address!: string;
  designation!: string;
  status!:number;
  can_login!:number;
  date_of_birth!: string;
  created_at!: string;

  constructor(data: any) {
    Object.assign(this, data);
  }
}

export const fetchAll = async (): Promise<number> => {
  const { rows: users } = await database.execute(
    `select * from users`,
  );
  return users;
};

export const createUser = async (user: User): Promise<User | null> => {
  const hashedPassword = await hash(user.password);
  console.log(hashedPassword)
  const result = await database.execute(
    `INSERT INTO users (fullname, email, mobile, password, address, designation, date_of_birth, status, can_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.fullname, user.email, user.mobile, hashedPassword, user.address, user.designation, user.date_of_birth, user.status, user.can_login],
  );
  console.log(result);

  if (result.affectedRows > 0) {
    const insertedUserId = result.lastInsertId;
    const [insertedUser] = await database.query(
      "SELECT * FROM users WHERE id = ?",
      [insertedUserId],
    );

    return insertedUser[0] as User;
  }

  return null;
};


// export const findByID = async (id: any): Promise<number> => {
//   const result = await database.query("select * from ?? where id = ?", [
//     "users",
//     id,
//   ]);
//   console.log(result)
//   return result;
// };

export const findByID = async (id: any): Promise<any> => {
  try {
    console.log('paisi',id);
    const result = await database.query("SELECT * FROM users WHERE id = ?", [id]);
    return result;
  } catch (error) {
    console.error('error', error);
    throw error;
  }
};

export const updateUser = async (user: User): Promise<string> => {
  const getData = await database.query("select * from users where id = ?", [
    user.id,
  ]);
  if (getData != null) {
    const updateData = await database.query(
      "UPDATE users SET fullname = ?, email = ?, mobile = ?, address = ?, date_of_birth=?, designation = ? WHERE id = ?",
      [user.fullname, user.email, user.mobile, user.address, user.date_of_birth, user.designation, user.id],
    );
    return updateData;
  } else {
    return 0;
  }
};

export const deleteByID = async (id: any): Promise<any> => {
    const result = await database.query("DELETE FROM ?? WHERE id = ?", ["users", id]);
    console.log(result)
    return result.affectedRows || 0;
};

export default User;
