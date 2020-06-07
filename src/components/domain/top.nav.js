import React, { useContext, useState } from "react";
import {
  Icon,
  Layout,
  MenuItem,
  OverflowMenu,
  TopNavigation,
  Text,
  Button,
  Modal,
  Card,
  TopNavigationAction,
} from "@ui-kitten/components";
import { StyleSheet, TouchableOpacity } from "react-native";
import { LocalizationContext } from "../../context";
import { AsyncStorage } from "react-native";
const PersonIcon = (props) => <Icon {...props} name="person-outline" />;
import { CommonActions } from "@react-navigation/native";

// const EditIcon = (props) => <Icon {...props} name="edit" />;

const MenuIcon = (props) => <Icon {...props} name="more-vertical" />;
const ManageIcon = (props) => <Icon {...props} name="settings-2-outline" />;
const InfoIcon = (props) => <Icon {...props} name="info" />;

const LogoutIcon = (props) => <Icon {...props} name="log-out" />;
const GlobeIcon = (props) => <Icon {...props} name="globe-outline" />;
const ThemeIcon = (props) => <Icon {...props} name="color-palette-outline" />;

export default ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const { t, locale, setLocale } = useContext(LocalizationContext);
  const displayLang = locale.includes("en") ? "ur" : "en";
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const renderMenuAction = () => (
    <TopNavigationAction icon={MenuIcon} onPress={toggleMenu} />
  );

  const renderRightActions = () => {
    const { theme, setTheme } = useContext(LocalizationContext);
    return (
      <React.Fragment>
        <Button
          accessoryLeft={GlobeIcon}
          appearance="ghost"
          size={"tiny"}
          onPress={() => setLocale(locale.includes("en") ? "ur" : "en")}
        >
          {(displayLang || "").toUpperCase()}
        </Button>

        <OverflowMenu
          anchor={renderMenuAction}
          visible={menuVisible}
          onBackdropPress={toggleMenu}
        >
          <MenuItem
            accessoryLeft={ThemeIcon}
            title={theme.includes("light") ? "Dark" : "Light"}
            onPress={() => {
              setTheme(theme.includes("light") ? "dark" : "light");
              toggleMenu();
            }}
          />

          <MenuItem
            accessoryLeft={InfoIcon}
            title="About"
            onPress={() => {
              setAboutVisible(true);
              toggleMenu();
            }}
          />
          <MenuItem
            accessoryLeft={PersonIcon}
            title="Account"
            onPress={async () => {
              toggleMenu();
              navigation.navigate("SignUp", { account: true });
            }}
          />
          <MenuItem
            accessoryLeft={ManageIcon}
            title="Suit Type"
            onPress={async () => {
              toggleMenu();
              navigation.navigate("SuiteType");
            }}
          />
          <MenuItem
            accessoryLeft={ManageIcon}
            title="Archived"
            onPress={async () => {
              toggleMenu();
              navigation.navigate("ArchivedOrders");
            }}
          />

          <MenuItem
            accessoryLeft={LogoutIcon}
            title="Logout"
            onPress={async () => {
              await AsyncStorage.removeItem("passcode");
              toggleMenu();

              navigation.navigate("Entry", { logout: true });
            }}
          />
        </OverflowMenu>
      </React.Fragment>
    );
  };

  const renderBackAction = () => (
    <TopNavigationAction
      icon={(props) => <Icon {...props} name="home-outline" />}
    />
  );

  return (
    <Layout style={styles.container} level="1">
      <TouchableOpacity
        onPress={() => {
          navigation.dispatch(
            CommonActions.navigate({
              name: "MainHome",
            })
          );
        }}
      >
        <TopNavigation
          title={() => <Text category="h6">Perfect Cut</Text>}
          accessoryLeft={renderBackAction}
          accessoryRight={renderRightActions}
        />
      </TouchableOpacity>

      <Modal
        visible={aboutVisible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setAboutVisible(false)}
      >
        <Card disabled={true}>
          <Text category={"h6"}>About</Text>
          <Text category="c2">Developer : Fida Ullah</Text>
          <Text category="c2">Date : 06 June 2020</Text>
          <Text category="c2">Contact : 0342-5743819</Text>

          <Button size={"tiny"} onPress={() => setAboutVisible(false)}>
            close
          </Button>
        </Card>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 0,
    marginTop: 30,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
