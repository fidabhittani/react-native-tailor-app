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
import { LocalizationContext } from "../../context";
const { Navigator, Screen } = createBottomTabNavigator();

const Stack = createStackNavigator();
const ArchiveIcon = (props) => <Icon {...props} name="clock-outline" />;
const CancelledIcon = (props) => <Icon {...props} name="close-outline" />;

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
      <BottomNavigationTab title={t("archived_orders")} icon={ArchiveIcon} />
      <BottomNavigationTab title={t("cancelled_orders")} icon={CancelledIcon} />
    </BottomNavigation>
  );
};

export default ({ navigation: nav }) => {
  const ArchivedOrder = (props) => {
    return <Order {...props} type="archived" />;
  };
  const CancelledOrder = (props) => {
    return <Order {...props} type="cancelled" />;
  };

  return (
    <Layout style={styles.constainer}>
      <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
        <Screen name="archived" component={ArchivedOrder} />
        <Screen name="cancelled" component={CancelledOrder} />
      </Navigator>
    </Layout>
  );
};

// Order Routes
const styles = StyleSheet.create({
  constainer: {
    flex: 1,
  },
});
