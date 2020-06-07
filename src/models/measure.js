import Model from "./model";
import { TABLES, fields, tblAliases } from "../constants";

export default class Measure extends Model {
  constructor(db) {
    super(
      db,
      TABLES.MEASURE,
      tblAliases[TABLES.MEASURE],
      fields[TABLES.MEASURE]
    );
  }

  // Create Measure

  create(data) {
    return this.insert(data);
  }

  // Create or update

  // get Measure(s)
  get(params = undefined) {
    return this.select(this.fields, params);
  }

  /**
   * get customer with relations
   * @param {*} params
   */
  //   getFull(params) {
  //     return this.select(this.fields, params, {
  //       [TABLES.CUSTOMER]: {
  //         fields: fields[TABLES.CUSTOMER],
  //         on: { id: "customer_id" },
  //       },
  //     });
  //   }
}
