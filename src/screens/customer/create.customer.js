import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Text,
  Layout,
  Button,
  Icon,
  Input,
  Spinner,
  Autocomplete,
  AutocompleteItem,
} from "@ui-kitten/components";
import { ScrollView, StyleSheet } from "react-native";
import database from "../../database";
import { CustomerModel } from "../../models";
import { LocalizationContext } from "../../context";
import { validateCustomer } from "../../utils/validations";
import { convertToUnderScoreCase } from "../../utils";
import * as Contacts from "expo-contacts";

const customer = new CustomerModel(database.getDatabase());
const PersonIcon = (props) => <Icon {...props} name="person-outline" />;

const BackIcon = (props) => <Icon {...props} name="arrow-back-outline" />;
const dto = {
  name: "",
  age: "",
  phone: "",
  address: "",
};
export default ({ navigation, route }) => {
  const { t } = useContext(LocalizationContext);
  const [form, setForm] = useState({ ...dto });
  const autocompleteCustRef = useRef(null);

  const [phoneContacts, setPhoneContacts] = useState([]);
  const [phoneContactsOrig, setPhoneContactsOrig] = useState([]);

  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [dbErrors, setDBErrors] = useState([]);
  const { id: custId, page } = route.params || {};

  const onSelectCustomer = (index) => {
    const { name, phone } = phoneContacts[index] || {};
    setForm({
      ...form,
      name,
      phone,
    });
  };

  useEffect(() => {
    const shouldBecomeVisible =
      (autocompleteCustRef.current?.isFocused() || false) &&
      (phoneContacts?.length || 0) > 0;
    if (
      autocompleteCustRef.current?.state.listVisible !== shouldBecomeVisible
    ) {
      autocompleteCustRef.current?.setState({
        listVisible: shouldBecomeVisible,
      });
    }
  }, [phoneContacts?.length]);

  useEffect(() => {
    if (form.name) {
      const filterContacts = phoneContactsOrig.filter(
        ({ name = "", phone = "" }) =>
          name.toLowerCase().includes(form.name.toLowerCase()) ||
          phone
            .replace(/\s+/g, "")
            .toLowerCase()
            .includes(form.name.toLowerCase())
      );
      setPhoneContacts(filterContacts);
    } else {
      setPhoneContacts([]);
    }
  }, [form.name]);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Addresses,
          ],
        });

        if (data.length > 0) {
          const phoneContacts = data.map((contact) => {
            const [phone = {}] = contact.phoneNumbers || [];
            return {
              name: contact.name,
              phone: phone.number,
            };
          });
          // setPhoneContacts(phoneContacts);
          setPhoneContactsOrig(phoneContacts);
        }
      }
    })();
  }, []);

  const LoadingIndicator = (props) => (
    <Layout style={[props.style, styles.indicator]}>
      {loading.customer ? (
        <Spinner size="small" />
      ) : (
        <Icon {...props} name="save" />
      )}
    </Layout>
  );

  const handleFChange = (key, value) => {
    const errors = { ...errors };
    delete errors[key];

    setErrors(errors);
    setForm({
      ...form,
      [key]: value,
    });
  };

  const getCust = async () => {
    const { data: custs } = await customer.get({ id: custId });
    const [custmr] = custs;
    const existingCust = Object.keys(custmr).reduce((sum, key) => {
      const formedKey = convertToUnderScoreCase(key.substring(9));
      sum[formedKey] = `${custmr[key]}`;
      return sum;
    }, {});
    setForm(existingCust);
  };

  useEffect(() => {
    if (custId) {
      getCust();
    }
  }, [custId]);

  const saveCustomer = async () => {
    setLoading({ ...loading, validate: true });

    let { isValid, errors } = await validateCustomer(form, custId);
    setLoading({ ...loading, validate: false });

    if (!isValid) {
      setErrors(errors);
      return false;
    }
    try {
      setLoading({ ...loading, customer: true });

      const cust = await customer.createOrUpdate({ ...form, id: custId });
      if (custId) {
        if (page === "main") {
          navigation.navigate("CustomerHome", { customer: custId });
        } else {
          navigation.navigate("CustomerDetail", { customer: custId });
        }
      } else {
        navigation.navigate("CreateMeasure", {
          page,
          custId: cust.insertId,
        });
      }
    } catch (error) {
      setDBErrors(["Failed to create customer"]);
    } finally {
      setLoading({ ...loading, customer: false });
    }
  };

  return (
    <Layout style={styles.constainer}>
      <ScrollView>
        <Layout style={styles.createOrderTitle}>
          <Button
            style={styles.button}
            appearance="ghost"
            status="primary"
            accessoryLeft={BackIcon}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.text} category="s1">
            {t("create_customer")}&nbsp;
          </Text>
          {loading.validate && <Spinner />}
        </Layout>
        <Layout>
          {(dbErrors || []).map((error, key) => (
            <Text
              key={`dbError${key}`}
              style={styles.text}
              appearance="hint"
              status={"danger"}
            >
              {error}
            </Text>
          ))}
        </Layout>
        <Layout style={styles.form}>
          <Autocomplete
            placeholder={t("name_placeholder")}
            ref={autocompleteCustRef}
            value={form.name}
            onSelect={onSelectCustomer}
            caption={errors.name && t(errors.name)}
            status={errors.name && "danger"}
            onChangeText={(nextValue) => handleFChange("name", nextValue)}
          >
            {phoneContacts.map((item, index) => (
              <AutocompleteItem
                key={index}
                accessoryLeft={PersonIcon}
                accessoryRight={() => (
                  <Text appearance={"hint"} style={{ fontSize: 10 }}>
                    Phone Contacts
                  </Text>
                )}
                title={() => (
                  <Layout style={styles.contactItem}>
                    <Text style={{ fontSize: 12 }}>{item.name}</Text>
                    <Text appearance={"hint"} style={{ fontSize: 10 }}>
                      {item.phone}
                    </Text>
                  </Layout>
                )}
              />
            ))}
          </Autocomplete>

          {/* <Input
            placeholder={t("name_placeholder")}
            value={form.name}
            onChangeText={(nextValue) => handleFChange("name", nextValue)}
            caption={errors.name && t(errors.name)}
            status={errors.name && "danger"}
            style={styles.input}
          /> */}
          <Input
            placeholder={t("phone_placeholder")}
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(nextValue) => handleFChange("phone", nextValue)}
            caption={errors.phone && t(errors.phone)}
            status={
              errors.phone ? "danger" : "phone" in errors ? "success" : ""
            }
            style={styles.input}
          />

          <Input
            placeholder={t("age_placeholder")}
            value={form.age}
            keyboardType="numeric"
            caption={errors.age && t(errors.age)}
            status={errors.age && "danger"}
            onChangeText={(nextValue) => handleFChange("age", nextValue)}
            style={styles.input}
          />

          <Input
            placeholder={t("address_placeholder")}
            value={form.address}
            onChangeText={(nextValue) => handleFChange("address", nextValue)}
            caption={errors.age && t(errors.address)}
            status={errors.address && "danger"}
            style={styles.input}
          />
          <Button
            style={styles.button}
            appearance="outline"
            onPress={saveCustomer}
            accessoryLeft={LoadingIndicator}
          >
            {t("save")}
          </Button>
        </Layout>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
    overflow: "scroll",
  },
  input: {
    marginTop: 5,
    marginBottom: 5,
  },
  createOrderTitle: {
    alignItems: "center",
    flexDirection: "row",
  },
  indicator: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  form: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  contactItem: {},
});
