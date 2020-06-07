import Model from "./model";
import { TABLES, fields, tblAliases } from "../constants";

export default class Customer extends Model {
  constructor(db) {
    super(
      db,
      TABLES.CUSTOMER,
      tblAliases[TABLES.CUSTOMER],
      fields[TABLES.CUSTOMER]
    );
  }

  // Create Customer

  create(customer) {
    return this.insert(customer);
  }

  // get Cutomer(s)
  get(params = undefined) {
    return this.select(this.fields, params);
  }

  /**
   * get customer with relations
   * @param {*} params
   */
  getFull(params) {
    const tweakedParams = Object.keys(params).reduce((sum, key) => {
      sum[`${this.tableName}.${key}`] = params[key];
      return sum;
    }, {});

    return this.select(this.fields, tweakedParams, {
      [TABLES.MEASURE]: {
        fields: fields[TABLES.MEASURE],
        on: { customer_id: "id" },
      },
    });
  }
}
