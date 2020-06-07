import React, { useContext } from "react";
import { TriangleColorPicker } from "react-native-color-picker";
import { StyleSheet } from "react-native";

import {
  Popover,
  Button,
  Layout,
  Divider,
  Text,
  Icon,
} from "@ui-kitten/components";
import { LocalizationContext } from "../../context";

export default ColorPicker = ({
  color = undefined,
  visible = false,
  setVisible,
  setSelectedColor,
}) => {
  const { t } = useContext(LocalizationContext);
  return (
    <Popover
      visible={visible}
      anchor={() => (
        <Button
          accessoryLeft={(props) => (
            <Icon {...props} name="color-palette-outline" />
          )}
          appearance={"outline"}
          size={"small"}
          status="info"
          style={{
            ...styles.colorPickBtn,
          }}
          onPress={() => setVisible(true)}
        />
      )}
      onBackdropPress={() => setVisible(false)}
    >
      <Layout style={styles.colorPickerContent}>
        <TriangleColorPicker
          style={styles.colorPicker}
          onColorSelected={setSelectedColor}
        />
        <Divider />
        <Text appearance="hint" style={{ width: 180 }}>
          {t("select_color_message")}
        </Text>
      </Layout>
    </Popover>
  );
};
/**
 *
 *  Styles
 *
 */
const styles = StyleSheet.create({
  colorPicker: {
    width: 200,
    height: 200,
  },
  colorPickerContent: {
    flex: 1,
    margin: 10,
  },
  colorPickBtn: {
    margin: 5,
  },
});
