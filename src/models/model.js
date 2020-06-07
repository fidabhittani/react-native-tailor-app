export default class Model {
  constructor(db, tbl, alias, fields) {
    if (!db) {
      console.warn("No DB instance provided to model (super)");
      return;
    }
    this.tableName = tbl;
    this.tblAlias = alias;
    this.db = db;

    this.sql = ``;
    this.data = [];
    this.fields = fields;
  }

  /**
   *  Create SQL
   */
  insert = (data = {}) => {
    if (Object.keys(data).length === 0) {
      console.error("No data provided for insert");
      return;
    }

    const keys = Object.keys(data);
    const values = Object.values(data).reduce((sum, val) => {
      if (sum) {
        sum = `${sum},`;
      }
      sum = `${sum} "${val}"`;
      return sum;
    }, ``);
    const insertSQL = `INSERT INTO ${this.tableName} (${keys.join(
      ","
    )}) VALUES(${values})`;

    this.sql = `${insertSQL}`;
    return this.run();
  };

  createOrUpdate = (data) => {
    const { id, ...restData } = data;
    if (id) {
      return this.update(id, restData);
    }
    return this.insert(restData);
  };

  formatField = (tbl, fields) => {
    return (Array.isArray(fields) ? fields : [fields])
      .map((field) => {
        return `${tbl}.${field} as ${this.toCamel(String(tbl))}${this.toCamel(
          String(field)
        )}`;
      })
      .join(",");
  };

  toCamel = (s) => {
    return (s || "")
      .replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace("-", "").replace("_", "");
      })
      .replace(/(^.)/, (m) => m.toUpperCase());
  };

  /**
   *  Select Join
   *
   */

  clean = (str) => str.replace(/(^[,\s]+)|([,\s]+$)/g, "");

  select = (fields, where, joins = undefined, str = true) => {
    let selectedFields = joins
      ? Object.keys(joins).reduce((sum, key) => {
          const joinData = joins[key];
          if (sum) {
            sum = `${sum},`;
          }
          sum = `${sum} ${this.formatField(key, joinData.fields)}`;
          return sum;
        }, ``)
      : ``;

    selectedFields = this.clean(
      `${this.formatField(this.tableName, fields)}, ${selectedFields}`
    );

    this.sql = `SELECT ${selectedFields} FROM ${this.tableName} `;

    if (joins && typeof joins === "object") {
      const joinSql = Object.keys(joins).reduce((sum, key) => {
        const joinData = joins[key];
        const specifyOn = Object.keys(joinData.on).reduce((completOn, next) => {
          const value = joinData.on[next];
          const newKey = next.includes(".") ? next : `${key}.${next}`;
          const newValue = value.includes(".")
            ? value
            : `${this.tableName}.${value}`;
          completOn[newKey] = newValue;
          return completOn;
        }, {});

        sum = `${sum} INNER JOIN ${key} ON ${this.objectToSql(
          specifyOn,
          false
        )}`;
        return sum;
      }, ``);

      this.sql = `${this.sql} ${joinSql}`;
    }
    if (where) {
      return this.where(where, str).run();
    }

    return this.run();
  };

  enQuote = (str) => `"${str}"`;

  objectToSql = (params = {}, strValue = true, type = "AND") => {
    return Object.keys(params).reduce((sum, key, index) => {
      const andCaluse = `${index === 0 ? " " : type}`;
      sum = `${sum} ${key} = ${
        strValue ? this.enQuote(params[key]) : params[key]
      } ${andCaluse}`;
      return sum;
    }, ``);
  };

  notNum = (str) => Number(str) === "NaN";

  where = (params, str = true, type = "AND") => {
    if (params && typeof params == "object") {
      const whereData = this.objectToSql(params, str, type);
      this.sql = `${this.sql} WHERE ${whereData}`;
    }

    if (params && typeof params == "string") {
      this.sql = `${this.sql} WHERE ${params} = "${type}"`;
    }
    return this;
  };

  /**
   * Search
   */

  searchWhere = (params = {}) => {
    const searchQuery = Object.keys(params).reduce((sum, key, index) => {
      const andCaluse = `${index === 0 ? " " : "AND"}`;

      sum = `${key} LIKE ${this.enQuote("%" + params[key] + "%")} ${andCaluse}`;
      return sum;
    }, ``);
    this.sql = `${this.sql} WHERE (${searchQuery})`;
    return this;
  };

  search = (params, fields) => {
    fields = fields || this.fields;
    const selectedFields = this.formatField(this.tableName, fields);
    this.sql = `SELECT ${selectedFields} FROM ${this.tableName}`;
    return this.searchWhere(params).run();
  };

  /**
   *  UPDATE
   */
  update = (id, data) => {
    const setData = Object.keys(data).reduce((sum, key) => {
      sum = `${sum} ${key} = "${data[key]}" ,`;
      return sum;
    }, ``);

    this.sql = `UPDATE ${this.tableName} SET ${this.clean(setData)}`;
    return this.where({ id }).run();
  };

  /**
   *
   * DELETE
   */

  delete = (where) => {
    this.sql = `DELETE FROM ${this.tableName}`;
    return this.where(where).run();
  };

  /**
   *  RUN Query
   *
   */
  run = () => {
    const sql = `${this.sql};`;
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          sql,
          this.data ? this.data : [],
          (tx, { rows: { _array }, insertId, rowsAffected }) => {
            resolve({ data: _array, insertId, rowsAffected });
          },
          (tx, errors = []) => {
            reject(errors);
          }
        );
      });
    });
  };
}
