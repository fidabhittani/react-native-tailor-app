import database from "../database";
import { CustomerModel } from "../models";
const customer = new CustomerModel(database.getDatabase());

export const validateOrder = (form) => {
  let errors = {};

  if (!form.suite_type_id) {
    errors["suiteType"] = "suite_type_required_message";
  }

  if (!form.customer.CustomersName) {
    errors["customer"] = `customer_required_message`;
  }
  if (!form.no_of_suites) {
    errors["no_of_suites"] = `no_of_suites_required_message`;
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
};

export const validateUniquePhone = async (phone, custId) => {
  let results = null;
  try {
    const { data = [] } = await customer.get({ phone });

    let response = data;
    if (custId) {
      response = response.filter(
        (cust) => Number(cust.CustomersId) !== Number(custId)
      );
    }

    results = response;
  } catch (error) {
    results = null;
  }
  return results && results.length === 0;
};

/**
 *  Validate Suite Types
 * @param {\} form
 * @param {*} custId
 */

export const validateSuiteTypes = (form) => {
  let errors = {};

  if (!form.name) {
    errors["name"] = `name_required`;
  }

  if (!form.price) {
    errors["price"] = `price_required`;
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
};

/** Validate customer */

export const validateCustomer = async (form, custId = undefined) => {
  let errors = {};

  if (!form.name) {
    errors["name"] = `name_required`;
  }

  if (!form.phone) {
    errors["phone"] = `phone_required`;
  } else {
    const isValid = await validateUniquePhone(form.phone, custId);
    if (!isValid) {
      errors["phone"] = `phone_already_exists`;
    }
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
};

/**
 *
 * VALIDATE measure
 */
export const validateMeasure = (form) => {
  let errors = {};

  if (!form.kamiz_length) {
    errors["kamiz_length"] = `field_required`;
  }
  if (!form.bazu) {
    errors["bazu"] = `field_required`;
  }
  if (!form.tera) {
    errors["tera"] = `field_required`;
  }
  if (!form.galla) {
    errors["galla"] = `field_required`;
  }
  if (!form.chathi) {
    errors["chathi"] = `field_required`;
  }
  if (!form.kamar) {
    errors["kamar"] = `field_required`;
  }
  if (!form.gherra) {
    errors["gherra"] = `field_required`;
  }

  if (!form.shalwar_length) {
    errors["shalwar_length"] = `field_required`;
  }

  if (!form.paincha) {
    errors["paincha"] = `field_required`;
  }
  if (!form.shalwar_ghera) {
    errors["shalwar_ghera"] = `field_required`;
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
};

const minMessage = `Min 5 characters - کم از کم 5 حرف`;

export const validateSignUpForm = (form) => {
  let errors = {};
  if (!form.brand_name) {
    errors["brand_name"] = "Brand name Required - برانڈ نام ضروری ہے";
  } else {
    if (form.brand_name.length < 5) {
      errors["brand_name"] = minMessage;
    }
  }
  if (!form.user_name) {
    errors["user_name"] = "Username Required - صارف نام ضروری ہے";
  } else {
    if (form.user_name.length < 5) {
      errors["user_name"] = minMessage;
    }
  }

  if (!form.pass_code) {
    errors["pass_code"] = "Pass Code Required - پاس کوڈ ضروری ہے";
  } else {
    if (form.pass_code.length < 5) {
      errors["pass_code"] = minMessage;
    }
  }
  if (!form.phone) {
    errors["phone"] = "Phone Required - فون ضروری ہے";
  }
  if (!form.price) {
    errors["price"] = "Price Required - قیمت ضروری ہے";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
