// import SQLite from "react-native-sqlite-storage";
import * as SQLite from "expo-sqlite";

import DatabaseInitialization from "./initialize";
import { DATABASE } from "../constants";

class Database {
  database = undefined;

  // Open the connection to the database
  open() {
    // SQLite.DEBUG(true);
    // SQLite.enablePromise(true);
    let databaseInstance = undefined;
    try {
      databaseInstance = SQLite.openDatabase(DATABASE.FILE_NAME);
      const dbInit = new DatabaseInitialization(databaseInstance);
      dbInit.updateDatabaseTables();
      this.database = databaseInstance;
    } catch (error) {
      console.log("Failed to open db", error);
    }
    return databaseInstance;
  }

  // Close the connection to the database
  // close() {
  //   if (this.database === undefined) {
  //     return Promise.reject("[db] Database was not open; unable to close.");
  //   }
  //   return this.database.close().then((status) => {
  //     console.log("[db] Database closed.");
  //     this.database = undefined;
  //   });
  // }

  getDatabase() {
    if (this.database !== undefined) {
      return this.database;
    }
    // otherwise: open the database first
    return this.open();
  }
}
export default new Database();
