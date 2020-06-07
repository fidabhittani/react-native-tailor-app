import React, { useContext, useState } from "react";
import Order from "./order";
import { StyleSheet } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  Layout,
} from "@ui-kitten/components";
import { createStackNavigator } from "@react-navigation/stack";
import CreateOrder from "./create.order";
import FloatingButton from "../../components/common/floating.btn";
import { LocalizationContext } from "../../context";
const { Navigator, Screen } = createBottomTabNavigator();

const Stack = createStackNavigator();
const PendingIcon = (props) => <Icon {...props} name="flag-outline" />;
const ActiveIcon = (props) => <Icon {...props} name="activity-outline" />;
const CompletedIcon = (props) => (
  <Icon {...props} name="checkmark-circle-outline" />
);
const DeliveredIcon = (props) => (
  <Icon {...props} name="arrowhead-right-outline" />
);

const BottomTabBar = ({ navigation, state, route }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useContext(LocalizationContext);

  return (
    <BottomNavigation
      selectedIndex={selectedIndex}
      onSelect={(index) => {
        setSelectedIndex(index);
        navigation.navigate(state.routeNames[index]);
      }}
    >
      <BottomNavigationTab title={t("pending_orders")} icon={PendingIcon} />
      <BottomNavigationTab title={t("active_orders")} icon={ActiveIcon} />
      <BottomNavigationTab title={t("completed_orders")} icon={CompletedIcon} />
      <BottomNavigationTab title={t("delivered_orders")} icon={DeliveredIcon} />
    </BottomNavigation>
  );
};

const OrdersTabs = ({ navigation: nav }) => {
  const PendingOrder = (props) => {
    return <Order {...props} type="pending" />;
  };
  const ActiveOrder = (props) => {
    return <Order {...props} type="active" />;
  };
  const CompletedOrder = (props) => {
    return <Order {...props} type="completed" />;
  };
  const DeliveredOrder = (props) => {
    return <Order {...props} type="delivered" />;
  };

  return (
    <Layout style={styles.constainer}>
      <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
        <Screen name="pending" component={PendingOrder} />
        <Screen name="active" component={ActiveOrder} />
        <Screen name="completed" component={CompletedOrder} />
        <Screen name="delivered" component={DeliveredOrder} />
      </Navigator>
      <FloatingButton
        status="primary"
        onPress={() => nav.navigate("CreateOrder")}
      />
    </Layout>
  );
};

// Order Routes
export default () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrderHome"
        component={OrdersTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateOrder"
        component={CreateOrder}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
const styles = StyleSheet.create({
  constainer: {
    flex: 1,
  },
});
