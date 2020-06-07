import React, { useState, useEffect, useContext, useCallback } from "react";
import { StyleSheet, RefreshControl, ToastAndroid, Alert } from "react-native";
import {
  Divider,
  List,
  ListItem,
  Layout,
  Spinner,
  Text,
  Button,
  Icon,
  Input,
} from "@ui-kitten/components";
import FloatingButton from "../../components/common/floating.btn";
import { LocalizationContext } from "../../context";
import CreateCustomer from "./create.customer";
import CustomerDetail from "./details";
import { createStackNavigator } from "@react-navigation/stack";
import database from "../../database";
import { CustomerModel } from "../../models";
import CreateMeasure from "./create.measure";
const customer = new CustomerModel(database.getDatabase());
const Stack = createStackNavigator();

const TrashIcon = (props) => <Icon {...props} name="trash-2-outline" />;
const EditIcon = (props) => <Icon {...props} name="edit-2-outline" />;

const Customers = ({ navigation, route }) => {
  const [customers, setCustomers] = useState([]);
  const [customersOrig, setCustomersOrig] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { t } = useContext(LocalizationContext);

  const deleteCustomerAlert = (item) => {
    Alert.alert(
      "Sure?",
      `Are you sure to delete ${item.CustomersName}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Yes", onPress: () => deleteCustomer(item.CustomersId) },
      ],
      { cancelable: false }
    );
  };

  const deleteCustomer = async (id) => {
    try {
      const response = await customer.delete({ id });
      if (response) {
        ToastAndroid.show("Customer deleted successfully", ToastAndroid.SHORT);
        onRefresh();
      }
    } catch (error) {
      ToastAndroid.show("Failed to delete customer", ToastAndroid.SHORT);
    }
  };
  const onRefresh = useCallback(() => {
    if (!refreshing) {
      setRefreshing(true);
      customer
        .get()
        .then(({ data }) => {
          setCustomers(data);
          setCustomersOrig(data);
        })
        .finally(() => {
          setRefreshing(false);
        });
    }
  }, [refreshing]);

  useEffect(() => {
    onRefresh(true);
  }, [route]);

  const onSearchCust = (query) => {
    setSearchText(query);
    // if (searchText) {
    //   const filterCustomers = customersOrig.filter((cust) =>
    //     cust.CustomersName.toLowerCase().includes(query.toLowerCase())
    //   );
    //   setCustomers(filterCustomers);
    // } else {
    //   setCustomers(customersOrig);
    // }
  };

  // useEffect(() => {
  //   if (searchText) {
  //     const filterCustomers = customersOrig.filter((cust) =>
  //       cust.CustomersName.toLowerCase().includes(searchText.toLowerCase())
  //     );
  //     setCustomers(filterCustomers);
  //   } else {
  //     setCustomers(customersOrig);
  //   }
  // }, [searchText]);

  const renderItemIcon = (props) => <Icon {...props} name="person" />;
  const renderRightSide = (item) => {
    return (
      <Layout style={styles.row}>
        <Button
          style={styles.button}
          size={"tiny"}
          status={"danger"}
          appearance="outline"
          accessoryLeft={TrashIcon}
          onPress={() => deleteCustomerAlert(item)}
        />
        <Button
          style={styles.button}
          status="success"
          size={"tiny"}
          appearance="outline"
          onPress={() => {
            navigation.navigate("CreateCustomer", {
              id: item.CustomersId,
              page: "main",
            });
          }}
          accessoryLeft={EditIcon}
        />
      </Layout>
    );
  };
  const renderItem = ({ item, index }) => (
    <ListItem
      title={`${item.CustomersName}`}
      description={`${item.CustomersPhone}`}
      accessoryLeft={renderItemIcon}
      accessoryRight={() => renderRightSide(item)}
      onPress={() =>
        navigation.navigate("CustomerDetail", { customer: item.CustomersId })
      }
    />
  );

  // return <Text>Abc</Text>;
  if (refreshing) {
    return (
      <Layout style={styles.main}>
        <Spinner status="success" />
      </Layout>
    );
  }

  const CustList = () => (
    <>
      {/* <Input
        style={styles.searchInput}
        placeholder={"Search..."}
        value={searchText}
        onChangeText={(query) => onSearchCust(query)}
        // accessoryRight={(props) => <Icon {...props} name="search-outline" />}
      /> */}
      <List
        style={styles.custList}
        data={customers}
        ItemSeparatorComponent={Divider}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#a8df65", "#edf492"]}
          />
        }
      />
    </>
  );

  return (
    <Layout style={{ flex: 1 }}>
      {refreshing ? (
        <Layout style={styles.centeredView}>
          <Spinner />
        </Layout>
      ) : customers && customers.length === 0 ? (
        <Layout style={styles.centeredView}>
          <Text>{t(`no_customers`)}</Text>
        </Layout>
      ) : (
        <CustList />
      )}
      <FloatingButton
        status="primary"
        onPress={() => navigation.navigate("CreateCustomer")}
      />
    </Layout>
  );
};

// export default Customers;

export default () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CustomerHome"
        component={Customers}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateCustomer"
        component={CreateCustomer}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateMeasure"
        component={CreateMeasure}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetail}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  custList: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
  },
  button: {
    marginLeft: 3,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    paddingBottom: 0,
    borderColor: "transparent",

    // backgroundColor: "transparent",
  },
});
