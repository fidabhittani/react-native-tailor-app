import React from "react";
import { StyleSheet, View } from "react-native";

import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Home from "./screens/home";
// import SignIn from "./screens/auth/sign.in";
import SignUp from "./screens/auth/sign.up";
import TopNav from "./components/domain/top.nav";
import Entry from "./screens/entry";
const Stack = createStackNavigator();

export default ({}) => {
  return (
    <View style={styles.app}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Entry">
          <Stack.Screen
            name="Entry"
            component={Entry}
            options={{
              title: "Perfect Cut پرفیکٹ کٹ میں خوش آمدید",
            }}
          />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              title: "Perfect Cut",
              header: (props) => {
                return <TopNav {...props} />;
              },
            }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{
              title: "Register - رجسٹر کریں",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
});
