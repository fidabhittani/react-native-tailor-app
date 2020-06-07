import React from "react";
import {
  Autocomplete,
  Layout,
  Spinner,
  AutocompleteItem,
  Text,
} from "@ui-kitten/components";
import { StyleSheet } from "react-native";

const AutocompleteList = ({
  loading = false,
  children,
  reference,
  message = "",
  ...restOfprops
}) => {
  return (
    <Layout style={styles.container}>
      <Layout style={{ flex: 4 }}>
        <Autocomplete ref={reference} {...restOfprops}>
          {children}
        </Autocomplete>
      </Layout>
    </Layout>
  );
};

export default AutocompleteList;
/**
 * Styles
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
