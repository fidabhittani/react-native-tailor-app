import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { Layout, Button, Input, Icon } from "@ui-kitten/components";
import ColorPicker from "../common/color.picker";

const isColor = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);
import { LocalizationContext } from "../../context";
export default SuiteColorPicker = ({
  colors = [],
  colorPickerFlags = {},
  setColors,
  setIsCamera,
  setPickerVisible,
}) => {
  const { t } = useContext(LocalizationContext);
  return (
    <Layout>
      {colors.map((el, index) => {
        const key = [`picker-${index}`];
        return (
          <Layout style={styles.suiteColors} key={`${key}`}>
            <Layout
              style={{
                flex: 2,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Input
                placeholder={t("suite_color", { num: index + 1 })}
                // label={`Suite # ${index + 1} Color`}
                label={t("suite_color", { num: index + 1 })}
                value={colors[index]}
                style={{
                  flex: 1,
                  textTransform: "capitalize",
                  ...(isColor(colors[index]) && {
                    color: colors[index],
                  }),
                }}
                onChangeText={(nextValue) => {
                  const updatedColors = [...colors];
                  updatedColors[index] = nextValue;
                  setColors(updatedColors);
                }}
              />
            </Layout>
            <Layout
              style={{
                flex: 1,
                justifyContent: "center",
                flexDirection: "row",
                alignItems: "flex-end",
              }}
            >
              <ColorPicker
                colors={colors}
                visible={colorPickerFlags[key]}
                setVisible={(flag) => {
                  setPickerVisible(flag, key);
                }}
                setSelectedColor={(color) => {
                  const colorCopy = colors.slice();
                  colorCopy[index] = color;
                  setColors(colorCopy);
                  setPickerVisible(false, key);
                }}
              />

              <Button
                style={styles.colorPickBtn}
                appearance={"outline"}
                size={"small"}
                disabled
                accessoryLeft={(props) => (
                  <Icon {...props} name="image-outline" />
                )}
                status="info"
                onPress={() => setIsCamera(true)}
              />
            </Layout>
          </Layout>
        );
      })}
    </Layout>
  );
};

/**
 *  Styles
 *
 */

const styles = StyleSheet.create({
  suiteColors: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  colorPickBtn: {
    margin: 5,
  },
});
