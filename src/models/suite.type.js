import { TABLES, fields, tblAliases } from "../constants";
import Model from "./model";

export default class SuiteType extends Model {
  constructor(db) {
    super(db, TABLES.SUITETYPE);
    super(db, TABLES.SUITETYPE, tblAliases[TABLES.SUITETYPE]);

    this.fields = fields[TABLES.SUITETYPE];
  }

  // Create suite type

  create(data) {
    return this.insert(data);
  }

  // get suite types

  get(where = undefined) {
    return this.select(this.fields, where);
  }
}
