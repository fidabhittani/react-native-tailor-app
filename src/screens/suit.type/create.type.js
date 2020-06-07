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
import { SuiteTypeModel } from "../../models";
import { LocalizationContext } from "../../context";
import { validateSuiteTypes } from "../../utils/validations";
import { convertToUnderScoreCase } from "../../utils";

const suitType = new SuiteTypeModel(database.getDatabase());
const PersonIcon = (props) => <Icon {...props} name="person-outline" />;

const BackIcon = (props) => <Icon {...props} name="arrow-back-outline" />;
const dto = {
  name: "",
  price: "",
  discount: "",
  description: "",
};
export default ({ navigation, route }) => {
  const { t } = useContext(LocalizationContext);
  const [form, setForm] = useState({ ...dto });

  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [dbErrors, setDBErrors] = useState([]);
  const { id: typeId } = route.params || {};

  const LoadingIndicator = (props) => (
    <Layout style={[props.style, styles.indicator]}>
      {loading.type ? (
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

  const getType = async () => {
    const { data } = await suitType.get({ id: typeId });
    const [type] = data;
    const existingtype = Object.keys(type).reduce((sum, key) => {
      const formedKey = convertToUnderScoreCase(key.substring(10));
      sum[formedKey] = `${type[key]}`;
      return sum;
    }, {});
    setForm({ ...form, ...existingtype });
  };

  useEffect(() => {
    typeId && getType();
  }, [typeId]);

  const saveSuiteType = async () => {
    let { isValid, errors } = await validateSuiteTypes(form);
    if (!isValid) {
      setErrors(errors);
      return false;
    }
    try {
      setLoading({ ...loading, suitType: true });

      const type = await suitType.createOrUpdate({ ...form, id: typeId });
      navigation.navigate("SuiteTypeHome", { id: type.insertId || typeId });
    } catch (error) {
      setDBErrors(["Failed to create suite type"]);
    } finally {
      setLoading({ ...loading, suitType: false });
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
            {t("create_suite_type", {
              type: typeId ? t("update") : t("create"),
            })}
            &nbsp;
          </Text>
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
          <Input
            placeholder={t("suite_name_placeholder")}
            value={form.name}
            onChangeText={(nextValue) => handleFChange("name", nextValue)}
            caption={errors.name && t(errors.name)}
            status={errors.name && "danger"}
            style={styles.input}
          />
          <Input
            placeholder={t("suite_price_placeholder")}
            value={`${form.price}`}
            keyboardType="numeric"
            onChangeText={(nextValue) => handleFChange("price", nextValue)}
            caption={errors.price && t(errors.price)}
            status={errors.phone && "danger"}
            style={styles.input}
          />

          <Input
            placeholder={`${t("suite_discount_placeholder")} - %`}
            value={`${form.discount}`}
            keyboardType="numeric"
            onChangeText={(nextValue) => handleFChange("discount", nextValue)}
            style={styles.input}
            maxLength={2}
          />

          <Input
            placeholder={t("suite_desc_placeholder")}
            value={form.description}
            onChangeText={(nextValue) =>
              handleFChange("description", nextValue)
            }
            style={styles.input}
          />
          <Button
            style={styles.button}
            appearance="outline"
            onPress={saveSuiteType}
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
