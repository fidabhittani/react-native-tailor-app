import React from "react";
import { Layout, Button, Icon } from "@ui-kitten/components";
import { StyleSheet } from "react-native";
const StarIcon = (props) => <Icon {...props} name="plus" />;

export default (props) => (
  <Layout style={styles.floatingaction}>
    <Button {...props} style={styles.floatingbtn} accessoryLeft={StarIcon} />
  </Layout>
);

const styles = StyleSheet.create({
  floatingaction: {
    flex: 1,
    position: "absolute",
    right: 0,
    bottom: 60,
    padding: 20,
    backgroundColor: "transparent",
    zIndex: 0,
  },
  floatingbtn: {
    borderRadius: 1000,
    width: 60,
    height: 60,
  },
});
