// src/models/User.ts
import database from "../config/database.ts"

class User {
  id!: number;
  fullname!: string;
  email!: string;
  mobile!: string;
  address!: string;
  designation!: string;

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
  const result = await database.execute(
    `INSERT INTO users (fullname, email, mobile, address, designation) VALUES (?, ?, ?, ?, ?)`,
    [user.fullname, user.email, user.mobile, user.address, user.designation],
  );

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
      "UPDATE users SET fullname = ?, email = ?, mobile = ?, address = ?, designation = ? WHERE id = ?",
      [user.fullname, user.email, user.mobile, user.address, user.designation, user.id],
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
