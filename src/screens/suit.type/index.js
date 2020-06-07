import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import { StyleSheet, RefreshControl, ToastAndroid, Alert } from "react-native";
import {
  Divider,
  List,
  ListItem,
  Text,
  Icon,
  Button,
  Layout,
  Spinner,
} from "@ui-kitten/components";
import { LocalizationContext } from "../../context";

import { SuiteTypeModel } from "../../models";
import database from "../../database";
import FloatingButton from "../../components/common/floating.btn";
import { createStackNavigator } from "@react-navigation/stack";
import CreateSuiteType from "./create.type";
const TrashIcon = (props) => (
  <Icon {...props} name="trash-2-outline" fill="#CA0909" />
);

const suitType = new SuiteTypeModel(database.getDatabase());
const Stack = createStackNavigator();

const EditIcon = (props) => <Icon {...props} name="edit-2-outline" />;

const SuiteItem = ({ item, navigation, onRefresh, index }) => {
  const zoomIconRef = useRef();
  useEffect(() => {
    if (zoomIconRef && zoomIconRef.current) {
      zoomIconRef.current.startAnimation();
    }
  }, []);

  const { t } = useContext(LocalizationContext);
  const deleteSuiteAlert = () => {
    Alert.alert(
      t("sure"),
      `${t("sure_message", { type: item.SuiteTypesName })}`,
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        { text: t("yes"), onPress: () => deleteSuiteType(item.SuiteTypesId) },
      ],
      { cancelable: false }
    );
  };
  const deleteSuiteType = async (id) => {
    try {
      const response = await suitType.delete({ id });
      if (response) {
        ToastAndroid.show(
          "Suite Type deleted successfully",
          ToastAndroid.SHORT
        );
        onRefresh();
      }
    } catch (error) {
      ToastAndroid.show("Failed to delete suite type", ToastAndroid.SHORT);
    }
  };

  const renderItemLeft = (props) => <Icon {...props} name={`file`} />;
  const renderItemRight = () => {
    return (
      <Layout style={styles.row}>
        <Icon
          ref={zoomIconRef}
          animationConfig={{ cycles: Infinity }}
          animation="zoom"
          name="bulb-outline"
          fill={"#B60808"}
          style={{
            ...styles.icon,
            ...(!item.SuiteTypesDiscount && { display: "none" }),
          }}
        />

        {index !== 0 && (
          <Button
            style={styles.button}
            size={"tiny"}
            status={"danger"}
            appearance="outline"
            accessoryLeft={TrashIcon}
            onPress={deleteSuiteAlert}
          />
        )}
        <Button
          style={styles.button}
          status="success"
          size={"tiny"}
          appearance="outline"
          onPress={() => {
            console.log({ item });
            navigation.navigate("CreateSuiteType", {
              id: item.SuiteTypesId,
            });
          }}
          accessoryLeft={EditIcon}
        />
      </Layout>
    );
  };

  return (
    <ListItem
      title={`${item.SuiteTypesName}`}
      description={() => {
        const { SuiteTypesPrice, SuiteTypesDiscount } = item;
        let discountPrice = 0;

        if (!isNaN(Number(SuiteTypesDiscount))) {
          discountPrice =
            (Number(SuiteTypesPrice) / 100) * Number(SuiteTypesDiscount);
        }
        const newPrice = Number(SuiteTypesPrice) - Number(discountPrice);

        return (
          <Layout style={styles.rownalign}>
            <Text
              style={{ fontSize: 12, marginLeft: 10 }}
              appearance={"hint"}
            >{`Amount:`}</Text>

            <Text
              style={{
                fontSize: 10,
                marginLeft: 5,
                textDecorationLine: "line-through",
                color: "red",
                ...(!discountPrice && {
                  display: "none",
                }),
              }}
              appearance={"hint"}
            >{`${SuiteTypesPrice}`}</Text>
            <Text
              style={{ fontSize: 10, marginLeft: 5 }}
              appearance={"hint"}
            >{`${newPrice}/-`}</Text>
          </Layout>
        );
      }}
      accessoryRight={renderItemRight}
      accessoryLeft={renderItemLeft}
      // onPress={() => navigation.navigate("OrderDetail", { order: item })}
    />
  );
};

const SuiteType = ({ navigation, route }) => {
  const [suiteTypes, setSuiteTypes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  //   const { t } = useContext(LocalizationContext);

  const onRefresh = useCallback(() => {
    if (!refreshing) {
      setRefreshing(true);
      suitType.get().then(({ data: suiteTypes = [] }) => {
        setSuiteTypes(suiteTypes);
        setRefreshing(false);
      });
    }
  }, [refreshing]);

  useEffect(() => {
    onRefresh();
  }, [route]);

  // const onItemSelect = (index) => {
  //   setSelectedIndex(index);
  //   setVisible(false);
  // };

  const SuiteTypeList = () => (
    <List
      style={styles.orderlist}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#a8df65", "#edf492"]}
        />
      }
      data={suiteTypes || []}
      ItemSeparatorComponent={Divider}
      renderItem={({ item, index }) => (
        <SuiteItem
          navigation={navigation}
          item={item}
          onRefresh={onRefresh}
          index={index}
        />
      )}
    />
  );

  return (
    <Layout style={{ flex: 1 }}>
      {refreshing ? (
        <Layout style={styles.centeredView}>
          <Spinner />
        </Layout>
      ) : suiteTypes && suiteTypes.length === 0 ? (
        <Layout style={styles.centeredView}>
          <Text>No suite types</Text>
        </Layout>
      ) : (
        <SuiteTypeList />
      )}
      <FloatingButton
        status="primary"
        onPress={() => navigation.navigate("CreateSuiteType")}
      />
    </Layout>
  );
};

// const OrdersList = ({ navigation }) => {
//   // return <Text>Abc</Text>;
//   return <Order />;
// };

export default () => {
  return (
    <Stack.Navigator initialRouteName="SuiteTypeHome">
      <Stack.Screen
        name="SuiteTypeHome"
        options={{
          headerShown: false,
        }}
        component={SuiteType}
      />
      <Stack.Screen
        name="CreateSuiteType"
        options={{
          headerShown: false,
        }}
        component={CreateSuiteType}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  orderlist: {
    flex: 1,
  },
  rightsidelist: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  deleteMenuItem: {
    color: "red",
  },
  row: {
    flexDirection: "row",
  },
  rownalign: {
    flexDirection: "row",
    alignItems: "center",
  },
  custName: {
    fontSize: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginLeft: 5,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
