/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import { CustomerModel, OrderModel, SuiteTypeModel } from "../models";
import { TABLES, TABLE_SQL, getDropSql } from "../constants";

export default class DatabaseInitialization {
  // Perform any updates to the database schema. These can occur during initial configuration, or after an app store update.
  // This should be called each time the database is opened.
  dropAllTables = false;
  constructor(db) {
    if (!db) {
      console.warn("No DB instance provided to initlaize");
      return;
    }
    this.db = db;
    this.customerModel = new CustomerModel(db);
    this.orderModel = new OrderModel(db);
    this.suiteTypeModel = new SuiteTypeModel(db);
  }
  async updateDatabaseTables() {
    let dbVersion = 0;
    console.log("DB Updates... START");
    await this.createTables();
    console.log("DB Updates... DONE");
    if (this.dropAllTables) {
      // await this.seedData();
    }
  }

  // Creat Dummy test customers

  getRandomValues = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  seedData = async () => {
    // Seed Customers
    console.log("Seeding Tables");
    // this.suiteTypeModel.create({
    //   name: "Regular",
    //   price: 550,
    //   discount: 0,
    //   description: "Regular Suite",
    // });

    // Customers
    // this.customerModel.create({
    //   name: "Rizwan Tailor",
    //   age: 32,
    //   address: "Street 18, G13-1",
    //   phone: "03425743819",
    // });
    // this.customerModel.create({
    //   name: "Fida Ullah33",
    //   age: 25,
    //   address: "Street 18, G13-1",
    //   phone: "03445424522",
    // });
    // Suites Types
    this.suiteTypeModel.create({
      name: "Regular",
      price: 550,
      discount: 0,
      description: "Regular Suite",
    });
    // this.suiteTypeModel.create({
    //   name: "Executive Suite",
    //   price: 800,
    //   discount: 0,
    //   description: "Executive suite",
    // });
    // Orders

    // this.orderModel.create({
    //   suite_type_id: 2,
    //   customer_id: 1,
    //   order_date: null,
    //   delivery_date: null,
    //   delivery_location: "Arama Tala",
    //   no_of_suites: 1,
    //   suite_colors: "orange",
    //   order_status: "pending",
    // });

    // this.orderModel.create({
    //   suite_type_id: 1,
    //   customer_id: 1,
    //   order_date: null,
    //   delivery_date: null,
    //   delivery_location: "Gambila",
    //   no_of_suites: 2,
    //   suite_colors: "red",
    //   order_status: "active",
    // });
    // this.orderModel.create({
    //   suite_type_id: 2,
    //   customer_id: 1,
    //   order_date: null,
    //   delivery_date: null,
    //   delivery_location: "Arama Tala",
    //   no_of_suites: 2,
    //   suite_colors: "blue",
    //   order_status: "completed",
    // });
  };

  // Perform initial setup of the database tables
  createTables = async () => {
    // DANGER! For dev only
    if (this.dropAllTables) {
      console.log("Dropping all tables");
      this.db.transaction((tx) => {
        tx.executeSql(getDropSql(TABLES.APP));
        tx.executeSql(getDropSql(TABLES.SUITETYPE));
        tx.executeSql(getDropSql(TABLES.CUSTOMER));
        tx.executeSql(getDropSql(TABLES.MEASURE));
        tx.executeSql(getDropSql(TABLES.ORDER));
        tx.executeSql(getDropSql(TABLES.VERSION));
      });
    }

    this.db.transaction(
      (tx) => {
        // app table
        tx.executeSql(TABLE_SQL.APP);
        // suite_types table
        tx.executeSql(TABLE_SQL.SUITETYPE);

        tx.executeSql(TABLE_SQL.MEASURE);

        tx.executeSql(TABLE_SQL.CUSTOMER);

        tx.executeSql(TABLE_SQL.ORDER);
        // Version table
        tx.executeSql(TABLE_SQL.VERSION);
      },
      (error) => {
        console.log(` Problem DB:`, error);
      },
      () => {
        console.log("All Tables created successfully");
      }
    );
  };

  // Get the version of the database, as specified in the Version table
  getDatabaseVersion() {
    // Select the highest version number from the version table

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT version FROM Version ORDER BY ${TABLES.VERSION} DESC LIMIT 1;`,
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (error) => reject(error)
        );
      });
    });
  }

  // Once the app has shipped, use the following functions as a template for updating the database:
  /*
    // This function should be called when the version of the db is < 1
    private preVersion1Inserts(transaction: SQLite.Transaction) {
        console.log("Running pre-version 1 DB inserts");

        // Make schema changes
        transaction.executeSql("ALTER TABLE ...");

        // Lastly, update the database version
        transaction.executeSql("INSERT INTO Version (version) VALUES (1);");
    }

    // This function should be called when the version of the db is < 2
    private preVersion2Inserts(transaction: SQLite.Transaction) {
        console.log("Running pre-version 2 DB inserts");
        
        // Make schema changes
        transaction.executeSql("ALTER TABLE ...");

        // Lastly, update the database version
        transaction.executeSql("INSERT INTO Version (version) VALUES (2);");
    }
    */
}
