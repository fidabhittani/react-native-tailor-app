import React, { useState, useEffect, useRef, useContext } from "react";
import { StyleSheet, ScrollView } from "react-native";
import {
  Layout,
  Button,
  Input,
  Text,
  Icon,
  AutocompleteItem,
  Modal,
  Datepicker,
  SelectItem,
  Select,
  Spinner,
  IndexPath,
} from "@ui-kitten/components";
import { CustomerModel, SuiteTypeModel, OrderModel } from "../../models";
import AutocompleteList from "../../components/domain/autocomplete.list";
import database from "../../database";
import CameraView from "../../components/common/camera";
// import Autocomplete from "react-native-autocomplete-input";
import { CommonActions } from "@react-navigation/native";

import { Dimensions } from "react-native";
import SuiteColorPicker from "../../components/domain/suite.colors.pick";
import ImageColors from "react-native-image-colors";
import debounce from "lodash-es/debounce";
import { validateOrder } from "../../utils/validations";
import renderIndicator from "../../components/common/input.indicator";
// import NBAutocomplete from "native-base-autocomplete";
// import NBAutocomplete from "react-native-autocomplete-select";
import { LocalizationContext } from "../../context";
const { width } = Dimensions.get("window");
const { height } = Dimensions.get("screen");
const customer = new CustomerModel(database.getDatabase());
const suitType = new SuiteTypeModel(database.getDatabase());
const order = new OrderModel(database.getDatabase());

const dto = {
  customer: { CustomersName: "" },
  suite_type_id: 0,
  order_date: new Date(),
  delivery_date: new Date(),
  delivery_location: "",
  no_of_suites: 1,
  suite_colors: "",
};
const BackIcon = (props) => <Icon {...props} name="arrow-back-outline" />;
const PersonIcon = (props) => <Icon {...props} name="person-outline" />;
const CalendarIcon = (props) => <Icon {...props} name="calendar" />;
const CreateIcon = (props) => <Icon {...props} name="plus-square-outline" />;

const createEmptyArray = (len) =>
  Array.from({ length: Number(len) }, (_, i) => undefined);

export default ({ navigation }) => {
  const { t } = useContext(LocalizationContext);
  const autocompleteCustRef = useRef(null);
  const [form, setForm] = useState({ ...dto });
  const [errors, setErrors] = useState({});
  const [colors, setColors] = useState(createEmptyArray(form.no_of_suites));
  const [isCamera, setIsCamera] = useState(false);
  const [lookups, setLookups] = useState({});
  const [colorPickerFlags, setColorPickerFlags] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedSuiteType, setSelectedSuiteType] = useState(new IndexPath(0));

  const setLoadingLoad = (key, flag) => {
    setLoading({
      ...loading,
      [key]: flag,
    });
  };

  const handleChange = (k, v) => {
    const resForm = { ...form };
    resForm[k] = v;
    if (k === "no_of_suites") {
      setColors(createEmptyArray(v));
    }
    setForm(resForm);
  };

  const getSuiteTypes = async () => {
    setLoadingLoad("suiteTypes", true);
    const { data: sTypes } = await suitType.get();
    if (sTypes.length > 0) {
      const [first] = sTypes;
      handleChange("suite_type_id", first.SuiteTypesId);
    }

    setLookups({ ...lookups, suiteTypes: sTypes });
  };

  const getLookup = debounce(async (type) => {
    const nLookUps = { ...lookups };
    setLoadingLoad(type, true);
    let data = [];
    switch (type) {
      case "customer":
        const customers = await customer.search({
          name: form.customer.CustomersName,
        });
        data = customers.data;
        if (form.customer.CustomersName && data.length === 0) {
          setErrors({ ...errors, customer: `customers_not_found` });
        } else {
          setErrors({ customer: `` });
        }
        break;
    }

    setLoadingLoad(type, false);
    nLookUps[type] = data || [];
    setLookups(nLookUps);
  }, 500);

  useEffect(() => {
    if (form.customer.CustomersName && !form.customer.CustomersId) {
      setLookups({ ...lookups, customer: [] });
      getLookup("customer");
    }
  }, [form.customer.CustomersName]);

  useEffect(() => {
    const shouldBecomeVisible =
      (autocompleteCustRef.current?.isFocused() || false) &&
      (lookups.customer?.length || 0) > 0;
    if (
      autocompleteCustRef.current?.state.listVisible !== shouldBecomeVisible
    ) {
      autocompleteCustRef.current?.setState({
        listVisible: shouldBecomeVisible,
      });
    }
  }, [lookups.customer?.length]);

  useEffect(() => {
    getSuiteTypes();
  }, []);

  const onChangeTextComplete = (key, subKey, nextQuery) => {
    handleChange(key, { [subKey]: nextQuery });
  };
  const LoadingIndicator = (props) => (
    <Layout style={[props.style, styles.indicator]}>
      {loading.order ? (
        <Spinner size="small" />
      ) : (
        <Icon {...props} name="save" />
      )}
    </Layout>
  );

  const saveOrder = async () => {
    const { isValid, errors } = validateOrder(form);
    if (!isValid) {
      setErrors(errors);
      return false;
    }
    const { suiteType, customer, ...restForm } = form;

    const saveData = {
      ...restForm,
      // suite_type_id: suiteType.SuiteTypesId,
      customer_id: customer.CustomersId || 1,
      suite_colors: colors.join(","),
      order_status: "pending",
    };

    setLoadingLoad("order", true);
    const insert = await order.insert(saveData);
    navigation.navigate("pending");
    setLoadingLoad("order", false);
  };

  const setPickerVisible = (flag, index) => {
    setColorPickerFlags({
      ...colorPickerFlags,
      [index]: flag,
    });
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
            {t("create_order")}
          </Text>
        </Layout>

        <Layout style={styles.form}>
          <Layout
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AutocompleteList
              label={t("customer")}
              reference={autocompleteCustRef}
              placeholder={t("customer")}
              value={form.customer.CustomersName}
              onSelect={(index) =>
                handleChange("customer", lookups.customer[index])
              }
              status={errors.customer && "danger"}
              caption={errors.customer && t(errors.customer)}
              onChangeText={(query) =>
                onChangeTextComplete("customer", "CustomersName", query)
              }
              accessoryRight={renderIndicator(
                loading.customer,
                form.customer.CustomersName,
                () => handleChange("customer", { CustomersName: "" })
              )}
            >
              {((lookups && lookups.customer) || []).map((item, index) => (
                <AutocompleteItem
                  key={index}
                  // title={item.CustomersName}
                  title={() => (
                    <Layout style={styles.contactItem}>
                      <Text style={{ fontSize: 12 }}>{item.CustomersName}</Text>
                      <Text appearance={"hint"} style={{ fontSize: 10 }}>
                        {item.CustomersPhone}
                      </Text>
                    </Layout>
                  )}
                  accessoryLeft={PersonIcon}
                  accessoryRight={() => (
                    <Text appearance={"hint"} style={styles.address}>
                      {t("address")} : {item.CustomersAddress}
                    </Text>
                  )}
                />
              ))}
            </AutocompleteList>
            <Button
              style={{ marginLeft: 5, marginTop: 18 }}
              size={"small"}
              accessoryLeft={CreateIcon}
              onPress={() =>
                navigation.dispatch(
                  CommonActions.navigate({
                    name: "CreateCustomer",
                    params: { page: "order" },
                  })
                )
              }
            />
          </Layout>
          <Select
            style={styles.select}
            label={t("suite_type")}
            placeholder={t("suite_type")}
            value={
              lookups.suiteTypes &&
              lookups.suiteTypes[selectedSuiteType.row].SuiteTypesName
            }
            selectedIndex={selectedSuiteType}
            onSelect={(index) => {
              setSelectedSuiteType(index);
              handleChange(
                "suite_type_id",
                lookups.suiteTypes[index.row].SuiteTypesId
              );
            }}
          >
            {(lookups.suiteTypes || []).map((item, index) => (
              <SelectItem
                key={`${item.SuiteTypesName}##${index}`}
                title={item.SuiteTypesName}
                accessoryRight={() => (
                  <Text appearance={"hint"} style={{ fontSize: 10 }}>
                    Amount: &nbsp;{item.SuiteTypesPrice}/-
                  </Text>
                )}
              />
            ))}
          </Select>

          <Input
            placeholder={t("total_suite")}
            label={t("total_suite")}
            keyboardType="numeric"
            value={`${form.no_of_suites}`} //here
            onChangeText={(nextValue) =>
              handleChange("no_of_suites", nextValue)
            }
            status={errors.no_of_suites && "danger"}
            caption={errors.no_of_suites && t(errors.no_of_suites)}
          />

          <SuiteColorPicker
            colors={colors}
            colorPickerFlags={colorPickerFlags}
            setPickerVisible={setPickerVisible}
            setColors={setColors}
            setIsCamera={setIsCamera}
          />

          <Datepicker
            date={new Date(form.order_date)}
            label={t("order_date")}
            placeholder={t("order_date")}
            accessoryRight={CalendarIcon}
            onSelect={(nextDate) =>
              handleChange("order_date", nextDate.toLocaleDateString())
            }
          />

          <Datepicker
            date={new Date(form.delivery_date)}
            label={t("delivery_date")}
            placeholder={t("delivery_date")}
            accessoryRight={CalendarIcon}
            onSelect={(nextDate) =>
              handleChange("delivery_date", nextDate.toLocaleDateString())
            }
          />

          <Button
            style={styles.button}
            appearance="outline"
            onPress={saveOrder}
            accessoryLeft={LoadingIndicator}
          >
            {t("save")}
          </Button>
        </Layout>
        <Modal
          visible={isCamera}
          backdropStyle={styles.backdrop}
          onBackdropPress={() => setIsCamera(false)}
        >
          <Layout style={styles.camModal}>
            <CameraView
              onClose={() => setIsCamera(false)}
              onTake={async (pic) => {
                const colors = await ImageColors.getColors(pic.url, {
                  average: true,
                  defaultColor: "#000000",
                });

                console.log(colors, pic.url);
              }}
            />
          </Layout>
        </Modal>
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
    margin: 5,
  },
  createOrderTitle: {
    alignItems: "center",
    flexDirection: "row",
  },
  form: {
    paddingLeft: 10,
    paddingRight: 10,
  },

  camModal: {
    flex: 1,
    shadowColor: "#000",
    height,
    width,
    margin: 20,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
  indicator: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  autocomplete1: {
    flex: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 10,
    zIndex: 1,
  },
  address: {
    maxWidth: 120,
    fontSize: 8,
  },
});
