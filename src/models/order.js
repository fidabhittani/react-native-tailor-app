import Model from "./model";
import { TABLES, fields, tblAliases } from "../constants";

export default class Order extends Model {
  constructor(db) {
    super(db, TABLES.ORDER, tblAliases[TABLES.ORDER]);

    this.fields = fields[TABLES.ORDER];
  }

  // Create Order

  create(order) {
    return this.insert(order);
  }

  // Update Status

  updateStatus = ({ id, order_status }) => {
    return this.update(id, { order_status });
  };

  /**
   * get Orders
   * @param {*} params
   */
  get(params) {
    return this.select(this.fields, params, {
      [TABLES.CUSTOMER]: {
        fields: fields[TABLES.CUSTOMER],
        on: { id: "customer_id" },
      },
      [TABLES.SUITETYPE]: {
        fields: fields[TABLES.SUITETYPE],
        on: { id: "suite_type_id" },
      },
    });
  }
}
