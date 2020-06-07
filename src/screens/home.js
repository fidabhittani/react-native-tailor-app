import React, { useContext } from "react";
import { Icon, Tab, TabBar, Text } from "@ui-kitten/components";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import { LocalizationContext } from "../context";

import Customers from "../screens/customer";
import Orders from "../screens/orders";

import SuiteType from "./suit.type";
import ArchivedOrders from "../screens/orders/archived.orders";
const Stack = createStackNavigator();

const { Navigator, Screen } = createMaterialTopTabNavigator();

const PersonIcon = (props) => <Icon {...props} name="person-outline" />;
const BellIcon = (props) => <Icon {...props} name="bell-outline" />;

const TopTabBar = ({ navigation, state }) => {
  const { t } = useContext(LocalizationContext);
  return (
    <TabBar
      selectedIndex={state.index}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
    >
      <Tab title={t("orders")} icon={BellIcon} />
      <Tab title={t("customers")} icon={PersonIcon} />
    </TabBar>
  );
};

export const MainHome = () => {
  return (
    <Navigator
      tabBar={(props) => <TopTabBar {...props} />}
      initialRouteName="Orders"
    >
      <Screen name="Order" component={Orders} />
      <Screen name="Customers" component={Customers} />
    </Navigator>
  );
};

export default () => {
  return (
    <Stack.Navigator
      initialRouteName="MainHome"
      screenOptions={{
        headerTintColor: "white",
        headerStyle: {
          backgroundColor: "tomato",
        },
      }}
    >
      <Stack.Screen
        name="MainHome"
        options={{
          headerShown: false,
        }}
        component={MainHome}
      />
      <Stack.Screen
        name="SuiteType"
        options={{
          title: "Suit Types",
        }}
        component={SuiteType}
      />
      <Stack.Screen
        name="ArchivedOrders"
        options={{
          title: "Archived Orders",
        }}
        component={ArchivedOrders}
      />
    </Stack.Navigator>
  );
};
