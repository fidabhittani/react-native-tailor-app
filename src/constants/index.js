export const DATABASE = {
  FILE_NAME: "PerfectCut.db",
  BACKUP_FILE_NAME: "PerfectCut_BackUp.db",
};

export const TABLES = {
  CUSTOMER: "customers",
  APP: "app",
  MEASURE: "measures",
  ORDER: "orders",
  SUITETYPE: "suite_types",
  VERSION: "versions",
};

export const tblAliases = {
  [TABLES.APP]: "ap",
  [TABLES.CUSTOMER]: "cu",
  [TABLES.ORDER]: "or",
  [TABLES.MEASURE]: "mr",
  [TABLES.SUITETYPE]: "st",
  [TABLES.VERSION]: "vr",
};

export const fields = {
  [TABLES.APP]: [
    "id",
    "brand_name",
    "user_name",
    "pass_code",
    "location",
    "address",
    "phone",
    "lang",
    "theme",
  ],
  [TABLES.CUSTOMER]: ["id", "name", "age", "address", "phone"],
  [TABLES.MEASURE]: [
    "id",
    "kamiz_length",
    "bazu",
    "tera",
    "galla",
    "chathi",
    "kamar",
    "gherra",
    "shalwar_length",
    "paincha",
    "shalwar_ghera",
    "shalwar_pocket",
    "color_nok",
    "color_ban",
    "front_pocket",
    "side_pocket",
    "customer_id",
  ],
  [TABLES.SUITETYPE]: ["id", "name", "price", "discount", "description"],
  [TABLES.ORDER]: [
    "id",
    "suite_type_id",
    "customer_id",
    "order_date",
    "delivery_date",
    "delivery_location",
    "no_of_suites",
    "suite_colors",
    "order_status",
  ],
  [TABLES.VERSION]: ["id", "version"],
};

export const getDropSql = (tbl) => {
  return `DROP TABLE IF EXISTS ${tbl};`;
};

export const TABLE_SQL = {
  APP: ` CREATE TABLE IF NOT EXISTS ${TABLES.APP}(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    brand_name string,
    user_name string,
    pass_code string,
    location string,
    address string,
    lang string,
    phone string,
    theme string
     );
`,
  MEASURE: ` CREATE TABLE IF NOT EXISTS ${TABLES.MEASURE}(
   id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
   kamiz_length FLOAT(3, 3),
   bazu FLOAT(3, 3),
   tera FLOAT(3, 3),
   galla FLOAT(3, 3),
   chathi FLOAT(3, 3),
   kamar FLOAT(3, 3),
   gherra FLOAT(3, 3),
   shalwar_length string,
   paincha FLOAT(3, 3),
   shalwar_ghera FLOAT(3, 3),
   shalwar_pocket boolean DEFAULT 0,
   color_nok boolean DEFAULT 0,
   color_ban boolean DEFAULT 0,
   front_pocket boolean DEFAULT 0,
   side_pocket TEXT CHECK( side_pocket IN ('left','right','both') ) DEFAULT '',
   customer_id INTEGER,
   FOREIGN KEY ( customer_id ) REFERENCES customer ( id )
);
`,
  SUITETYPE: ` CREATE TABLE IF NOT EXISTS ${TABLES.SUITETYPE}(
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name string,
  price float,
  discount float,
  description Text
  );
`,
  CUSTOMER: `CREATE TABLE IF NOT EXISTS ${TABLES.CUSTOMER}(
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name string,
  age INTEGER DEFAULT 0,
  address Text,
  phone string UNIQUE
);
`,
  ORDER: ` CREATE TABLE IF NOT EXISTS ${TABLES.ORDER}(
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  suite_type_id INTEGER,
  customer_id INTEGER,
  order_date date DEFAULT NULL,
  delivery_date date DEAFAULT NULL,
  delivery_location string DEFAULT NULL,
  no_of_suites INTEGER DEFAULT 1,
  suite_colors TEXT DEFAULT NULL,
  order_status TEXT CHECK( order_status IN ('pending','active','completed', 'delivered', 'cancelled', 'archived') ) DEFAULT 'pending',
  FOREIGN KEY ( suite_type_id ) REFERENCES suite_types ( id ),
  FOREIGN KEY ( customer_id ) REFERENCES customers ( id )
);
`,
  VERSION: ` CREATE TABLE IF NOT EXISTS ${TABLES.VERSION}(
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  version INTEGER
);
`,
};
