import React, { useState, useEffect, useCallback, useContext } from "react";
import { StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Layout,
  Card,
  Text,
  Avatar,
  Spinner,
  Button,
  Icon,
} from "@ui-kitten/components";
import database from "../../database";
import { CustomerModel, MeasureModel } from "../../models";
import { LocalizationContext } from "../../context";

const customer = new CustomerModel(database.getDatabase());
const measure = new MeasureModel(database.getDatabase());
const BackIcon = (props) => <Icon {...props} name="arrow-back-outline" />;
const EditIcon = (props) => <Icon {...props} name="edit-outline" />;
const AddIcon = (props) => <Icon {...props} name="plus-circle-outline" />;

const CustomersDetails = ({ route, navigation }) => {
  const { t, isRTL } = useContext(LocalizationContext);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({});
  const { customer: id } = route.params || {};
  const [measureData, setMeasureData] = useState({});
  const [message, setMessage] = useState({ text: "", status: "info" });

  const onRefresh = useCallback(() => {
    if (!refreshing) {
      const getData = async () => {
        setRefreshing(true);
        try {
          const { data: custs } = await customer.get({ id });
          const [custmr] = custs;
          setData(custmr);

          const { data: measures } = await measure.get({ customer_id: id });
          const [measureData = {}] = measures || [];

          setMeasureData(measureData);
        } catch (error) {
          setMessage("Failed to get customer details");
        } finally {
          setRefreshing(false);
        }
      };
      getData();
    }
  }, [refreshing]);

  useEffect(onRefresh, [route.params]);
  if (refreshing) {
    return (
      <Layout style={styles.centered}>
        <Spinner status="success" />
      </Layout>
    );
  }

  // if (Object.keys(data).length === 0) {
  //   return null;
  // }
  const renderCard = (label, value, cust = true) => (
    <Card style={styles.card}>
      <Layout>
        <Text category="c2">{label}</Text>
        <Text category="c1" appearance="hint">
          {value}
        </Text>
      </Layout>
    </Card>
  );

  const renderMeasureDetail = () => {
    const rowStyles = {
      ...styles.row,
      flexDirection: isRTL ? "row-reverse" : "row",
    };
    return (
      <Layout>
        <Layout style={rowStyles}>
          {renderCard(t("kamiz_length"), measureData.MeasuresKamizLength)}

          {renderCard(t("bazu_m"), measureData.MeasuresBazu)}
          {renderCard(t("tera_m"), measureData.MeasuresTera)}
        </Layout>
        <Layout style={rowStyles}>
          {renderCard(t("galla_m"), measureData.MeasuresGalla)}
          {renderCard(t("chathi_m"), measureData.MeasuresChathi)}
          {renderCard(t("kamar_m"), measureData.MeasuresKamar)}
        </Layout>
        <Layout style={styles.row}>
          {renderCard(t("gherra_m"), measureData.MeasuresGherra)}
          {renderCard(t("shalwar_length"), measureData.MeasuresShalwarLength)}

          {renderCard(t("paincha_m"), measureData.MeasuresPaincha)}
        </Layout>
        <Layout style={styles.row}>
          {renderCard(t("shalwar_gherra_m"), measureData.MeasuresShalwarGhera)}

          {renderCard(t("side_pockets_m"), measureData.MeasuresSidePocket)}
          {renderCard(
            t("shalwar_pocket_m"),
            measureData.MeasuresShalwarPocket ? "YES" : "NO"
          )}
        </Layout>
        <Layout style={styles.row}>
          {renderCard(
            t("front_pocket_m"),
            measureData.MeasuresFrontPocket ? "YES" : "NO"
          )}
          {renderCard(
            t("color_nok_m"),
            measureData.MeasuresColorNok ? "YES" : "NO"
          )}
          {renderCard(
            t("color_ban_m"),
            measureData.MeasuresColorBan ? "YES" : "NO"
          )}
        </Layout>
      </Layout>
    );
  };

  // console.log(data);
  return (
    <Layout style={styles.topContainer} level="1">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#a8df65", "#edf492"]}
          />
        }
      >
        <Layout>
          <Layout style={styles.usertitle}>
            <Button
              style={styles.button}
              appearance="ghost"
              status="primary"
              accessoryLeft={BackIcon}
              onPress={() => navigation.goBack()}
            />

            <Avatar
              style={styles.avatar}
              size="large"
              source={require("../../../assets/brand/logo_transparent.png")}
            />
            <Layout>
              <Text category="s1">{data.CustomersName}</Text>
              <Layout style={{ flexDirection: "row" }}>
                <Icon style={styles.icon} fill="#8F9BB3" name="phone-outline" />

                <Text category="c2" appearance="hint">
                  &nbsp;{data.CustomersPhone}
                </Text>
              </Layout>
            </Layout>
            <Button
              style={styles.button}
              appearance="ghost"
              accessoryLeft={EditIcon}
              onPress={() =>
                navigation.navigate("CreateCustomer", { id: data.CustomersId })
              }
            />
          </Layout>

          {/* {renderCard("Phone", data.CustomersPhone)} */}
          {renderCard(t("address"), data.CustomersAddress)}
        </Layout>
        <Layout style={{ flex: 1 }}>
          <Layout
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <Text category="s1">{t("measure")}</Text>
            <Button
              size={"tiny"}
              accessoryLeft={measureData.MeasuresId ? EditIcon : AddIcon}
              onPress={() =>
                navigation.navigate("CreateMeasure", {
                  custId: id,
                  custName: data.CustomersName,
                  id: measureData.MeasuresId,
                })
              }
            >
              {measureData.MeasuresId ? t("change") : t("create")}
            </Button>
          </Layout>
          {measureData.MeasuresId ? (
            renderMeasureDetail()
          ) : (
            <Layout>
              <Text appearance="hint" category="c2">
                {t("no_measure_found")}
              </Text>
            </Layout>
          )}
        </Layout>
      </ScrollView>
    </Layout>
  );
};

export default CustomersDetails;

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
  },
  card: {
    margin: 2,
    flex: 1,
    padding: 0,
  },
  footerControl: {
    marginHorizontal: 2,
  },
  avatar: {
    margin: 8,
  },
  usertitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignSelf: "baseline",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  icon: {
    width: 16,
    height: 16,
  },
});
