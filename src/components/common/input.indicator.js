import React from "react";
import { TouchableWithoutFeedback, StyleSheet } from "react-native";
import { Icon, Layout, Spinner } from "@ui-kitten/components";

export default (loadin, query, cb) => (props) => {
  const closeBtn = (
    <TouchableWithoutFeedback onPress={cb}>
      <Icon {...props} name="close" />
    </TouchableWithoutFeedback>
  );

  return (
    <Layout style={[props.style, styles.indicator]}>
      {loadin ? (
        <Spinner size="small" />
      ) : query ? (
        closeBtn
      ) : (
        <Icon {...props} name="search" />
      )}
    </Layout>
  );
};
const styles = StyleSheet.create({
  indicator: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
