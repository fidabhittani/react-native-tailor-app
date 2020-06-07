import Model from "./model";
import { TABLES, fields, tblAliases } from "../constants";

export default class App extends Model {
  constructor(db) {
    super(db, TABLES.APP, tblAliases[TABLES.APP], fields[TABLES.APP]);
  }

  // Create Customer

  create(appSettings) {
    return this.insert(appSettings);
  }

  // get Cutomer(s)
  get(params = undefined) {
    return this.select(this.fields, params);
  }

  insertOrUpdate = async (appData) => {
    const { data } = await this.select(this.fields);
    if (data.length > 0) {
      const [appInstance] = data;
      return this.update(appInstance.AppId, appData);
    }

    return this.insert(appData);
  };
}
