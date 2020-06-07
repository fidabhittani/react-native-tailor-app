import React, { useState, useContext, useEffect } from "react";
import { CommonActions } from "@react-navigation/native";

import {
  Text,
  Layout,
  Button,
  Icon,
  Input,
  Spinner,
  Toggle,
  RadioGroup,
  Radio,
  Divider,
} from "@ui-kitten/components";
import { ScrollView, StyleSheet, ToastAndroid } from "react-native";
import database from "../../database";
import { MeasureModel } from "../../models";
import { validateMeasure } from "../../utils/validations";
import { LocalizationContext } from "../../context";

const measure = new MeasureModel(database.getDatabase());

const BackIcon = (props) => <Icon {...props} name="arrow-back-outline" />;
const CloseIcon = (props) => <Icon {...props} name="close" />;
const dto = {
  kamiz_length: "",
  bazu: "",
  tera: "",
  galla: "",
  chathi: "",
  kamar: "",
  gherra: "",
  shalwar_length: "",
  paincha: "",
  shalwar_ghera: "",
  shalwar_pocket: false,
  color_nok: false,
  color_ban: false,
  front_pocket: false,
  side_pocket: 1,
};
const sidePockets = ["left", "right", "both"];
export default ({ navigation, route }) => {
  const { t } = useContext(LocalizationContext);

  const [form, setForm] = useState({ ...dto });
  const [loading, setLoading] = useState(false);
  const [loadingMeasure, setMeasureLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const { custId, custName, id: mid, page } = route.params;

  const LoadingIndicator = (props) => (
    <Layout style={[props.style, styles.indicator]}>
      {loading ? <Spinner size="small" /> : <Icon {...props} name="save" />}
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
  const convertToUnderScoreCase = (str) => {
    return str
      .replace(/\.?([A-Z]+)/g, (x, y) => {
        return "_" + y.toLowerCase();
      })
      .replace(/^_/, "");
  };

  const getMeasure = async () => {
    setMeasureLoading(true);
    try {
      const { data: measures } = await measure.get({ customer_id: custId });

      const [measureData = {}] = measures || [];
      if (measureData.MeasuresId) {
        ToastAndroid.show(
          `Measures retrieved successfully`,
          ToastAndroid.SHORT
        );

        const { MeasuresSidePocket, ...restMeasure } = measureData;
        const existingMeasures = Object.keys(restMeasure).reduce((sum, key) => {
          const formedKey = convertToUnderScoreCase(key.substring(8));
          const value = ["true", "false"].includes(restMeasure[key])
            ? JSON.parse(restMeasure[key])
            : String(restMeasure[key]);
          sum[formedKey] = value;
          return sum;
        }, {});

        const sidePocketIndex = sidePockets.findIndex(
          (sp) => sp === MeasuresSidePocket
        );
        // if (sidePocketIndex !== -1) {

        //   handleFChange("side_pocket", sidePocketIndex);
        // }
        setForm({
          ...form,
          ...existingMeasures,
          side_pocket: sidePocketIndex !== -1 ? sidePocketIndex : 0,
        });
      }
      // setMeasureData(measureData);
    } catch (error) {
      ToastAndroid.show(`Failed to get measures details`, ToastAndroid.SHORT);
    } finally {
      setMeasureLoading(false);
    }
  };

  useEffect(() => {
    if (mid) {
      getMeasure();
    }
  }, [mid]);

  const onSaveMeasure = async () => {
    const { isValid, errors } = validateMeasure(form);
    if (!isValid) {
      setErrors(errors);
      return false;
    }

    try {
      setLoading(true);
      const data = {
        ...form,
        side_pocket: sidePockets[form.side_pocket],
        customer_id: custId,
        id: mid,
      };
      const { insertId } = await measure.createOrUpdate(data);
      const newParams = {
        customer: custId,
        random: Math.random() * 1000,
        mid: insertId,
      };
      if (page === "order") {
        // navigation.navigate("CreateOrder", newParams);
        navigation.dispatch(
          CommonActions.navigate({
            name: "CreateOrder",
            params: newParams,
          })
        );
      } else {
        navigation.navigate("CustomerDetail", newParams);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={styles.constainer}>
      <ScrollView style={styles.main}>
        <Layout
          style={{
            ...styles.createOrderTitle,

            justifyContent: "space-between",
          }}
        >
          <Layout style={{ flexDirection: "row" }}>
            <Button
              style={styles.button}
              appearance="ghost"
              status="primary"
              accessoryLeft={BackIcon}
              onPress={() => navigation.goBack()}
            />
            <Layout>
              <Text style={styles.text} category="s1">
                {t("create_measure")}&nbsp;&nbsp;&nbsp;
              </Text>

              <Text category="c1" appearance={"hint"}>
                {custName}
              </Text>
            </Layout>
          </Layout>

          <Layout>{loadingMeasure && <Spinner />}</Layout>
          <Button
            style={styles.button}
            appearance="ghost"
            status="primary"
            accessoryLeft={CloseIcon}
            onPress={() => {
              navigation.navigate("CustomerHome", {
                random: Math.random() * 100,
              });
            }}
          />
        </Layout>

        <Layout style={styles.form}>
          <Layout style={styles.row}>
            <Input
              label={t("kamiz_length")}
              placeholder={t("kamiz_length")}
              value={`${form.kamiz_length}`}
              onChangeText={(text) => handleFChange("kamiz_length", text)}
              caption={errors.kamiz_length && t(errors.kamiz_length)}
              status={errors.kamiz_length && "danger"}
              style={styles.rowInput}
              keyboardType={"numeric"}
              maxLength={2}
            />
            <Input
              label={t("bazu_m")}
              placeholder={t("bazu_m")}
              value={`${form.bazu}`}
              onChangeText={(text) => handleFChange("bazu", text)}
              caption={errors.bazu && t(errors.bazu)}
              status={errors.bazu && "danger"}
              style={styles.rowInput}
              maxLength={2}
              keyboardType={"numeric"}
            />
            <Input
              label={t("tera_m")}
              placeholder={t("tera_m")}
              value={`${form.tera}`}
              caption={errors.tera && t(errors.tera)}
              status={errors.tera && "danger"}
              onChangeText={(text) => handleFChange("tera", text)}
              style={styles.rowInput}
              keyboardType={"numeric"}
              maxLength={2}
            />
          </Layout>
          <Layout style={styles.row}>
            <Input
              label={t("galla_m")}
              placeholder={t("galla_m")}
              value={`${form.galla}`}
              caption={errors.galla && t(errors.galla)}
              status={errors.galla && "danger"}
              onChangeText={(text) => handleFChange("galla", text)}
              style={styles.rowInput}
              keyboardType={"numeric"}
              maxLength={2}
            />
            <Input
              label={t("chathi_m")}
              placeholder={t("chathi_m")}
              value={`${form.chathi}`}
              caption={errors.chathi && t(errors.chathi)}
              status={errors.chathi && "danger"}
              onChangeText={(text) => handleFChange("chathi", text)}
              style={styles.rowInput}
              keyboardType={"numeric"}
              maxLength={2}
            />
            <Input
              label={t("kamar_m")}
              placeholder={t("kamar_m")}
              value={`${form.kamar}`}
              caption={errors.kamar && t(errors.kamar)}
              status={errors.kamar && "danger"}
              onChangeText={(text) => handleFChange("kamar", text)}
              style={styles.rowInput}
              keyboardType={"numeric"}
              maxLength={2}
            />
          </Layout>
          <Layout style={styles.row}>
            <Input
              label={t("gherra_m")}
              placeholder={t("gherra_m")}
              value={`${form.gherra}`}
              caption={errors.gherra && t(errors.gherra)}
              status={errors.gherra && "danger"}
              onChangeText={(text) => handleFChange("gherra", text)}
              style={styles.rowInput}
              keyboardType={"numeric"}
              maxLength={2}
            />
            <Input
              label={t("shalwar_length")}
              placeholder={t("shalwar_length")}
              value={`${form.shalwar_length}`}
              caption={errors.shalwar_length && t(errors.shalwar_length)}
              status={errors.shalwar_length && "danger"}
              onChangeText={(text) => handleFChange("shalwar_length", text)}
              style={styles.rowInput}
              keyboardType={"numeric"}
              maxLength={2}
            />
            <Input
              label={t("paincha_m")}
              placeholder={t("paincha_m")}
              value={`${form.paincha}`}
              caption={errors.paincha && t(errors.paincha)}
              status={errors.paincha && "danger"}
              onChangeText={(text) => handleFChange("paincha", text)}
              style={styles.rowInput}
              keyboardType={"numeric"}
              maxLength={2}
            />
          </Layout>
          <Layout style={styles.row}>
            <Input
              label={t("shalwar_gherra_m")}
              placeholder={t("shalwar_gherra_m")}
              value={`${form.shalwar_ghera}`}
              caption={errors.shalwar_ghera && t(errors.shalwar_ghera)}
              status={errors.shalwar_ghera && "danger"}
              onChangeText={(text) => handleFChange("shalwar_ghera", text)}
              style={styles.rowInput}
              keyboardType={"numeric"}
              maxLength={2}
            />

            <Layout
              style={{
                ...styles.rowInput,
                flex: 2,
                justifyContent: "space-between",
              }}
            >
              <Text category="s2" appearance="hint">
                {t("side_pockets_m")} &nbsp;
              </Text>
              <RadioGroup
                selectedIndex={form.side_pocket}
                onChange={(index) => handleFChange("side_pocket", index)}
                style={{ flexDirection: "row", flexWrap: "wrap" }}
              >
                <Radio>{t("left")}</Radio>
                <Radio>{t("right")}</Radio>
                <Radio>{t("both")}</Radio>
              </RadioGroup>
            </Layout>
          </Layout>
          <Divider style={{ margin: 10 }} />
          {/* <Layout style={styles.row}>
        </Layout> */}

          <Layout style={styles.row}>
            <Toggle
              style={styles.rowInput}
              checked={form.shalwar_pocket}
              onChange={(isChecked) => {
                handleFChange("shalwar_pocket", isChecked);
              }}
            >
              {t("shalwar_pocket_m")}
            </Toggle>
            <Toggle
              style={styles.rowInput}
              checked={form.front_pocket}
              onChange={(isChecked) => {
                handleFChange("front_pocket", isChecked);
              }}
            >
              {t("front_pocket_m")}
            </Toggle>
          </Layout>
          <Layout style={styles.row}>
            <Toggle
              style={styles.rowInput}
              checked={form.color_ban}
              onChange={(isChecked) => {
                handleFChange("color_ban", isChecked);
              }}
            >
              {t("color_ban_m")} &nbsp;&nbsp;&nbsp;&nbsp;
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Toggle>
            <Toggle
              style={styles.rowInput}
              checked={form.color_nok}
              onChange={(isChecked) => {
                handleFChange("color_nok", isChecked);
              }}
            >
              {t("color_nok_m")} &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;
            </Toggle>
          </Layout>
          <Divider style={{ margin: 10 }} />
          <Text appearance={"hint"} status="warning">
            {t("measure_note")}
          </Text>
          <Divider style={{ margin: 10 }} />

          <Button
            style={styles.button}
            appearance="outline"
            accessoryLeft={LoadingIndicator}
            onPress={onSaveMeasure}
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
  },
  input: {
    margin: 5,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  rowInput: {
    flex: 1,
    margin: 3,
    fontSize: 10,
  },
});
