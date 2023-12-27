import {ClientMySQL, ClientPostgreSQL, ClientSQLite, NessieConfig} from "https://deno.land/x/nessie@2.0.11/mod.ts";
import { Client } from "https://deno.land/x/mysql/mod.ts";

// Connect to the database
const client = await new Client().connect({
    hostname: "localhost",
    port: 3306,
    username: "root",
    password: "nrb123456",
    db: "deno_api",
});

await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id int(11) NOT NULL AUTO_INCREMENT,
        fullname varchar(100) NULL,
        email varchar(100) NULL,
        mobile varchar(100) NULL,
        password varchar(100) NULL,
        date_of_birth varchar(100) NULL,
        address text NULL,
        designation text NULL,
        access_token text NULL,
        refresh_token text NULL,
        device_key text NULL,
        status int NOT NULL DEFAULT 1,
        can_login int NOT NULL DEFAULT 1,
        created_at timestamp not null default current_timestamp,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);

export default client