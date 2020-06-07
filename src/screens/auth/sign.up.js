import React, { useState, useEffect } from "react";
import {
  Text,
  Button,
  Layout,
  Input,
  Select,
  SelectItem,
  IndexPath,
  Spinner,
  Icon,
} from "@ui-kitten/components";
import {
  StyleSheet,
  ScrollView,
  AsyncStorage,
  TouchableWithoutFeedback,
} from "react-native";
import database from "../../database";
import { AppModel, SuiteTypeModel } from "../../models";
import { ToastAndroid } from "react-native";
import { convertToUnderScoreCase } from "../../utils";
const app = new AppModel(database.getDatabase());
const suiteType = new SuiteTypeModel(database.getDatabase());

import { validateSignUpForm } from "../../utils/validations";
const dto = {
  brand_name: "",
  user_name: "",
  pass_code: "",
  location: "",
  address: "",
  phone: "",
  lang: "ur",
  theme: "light",
};
const themes = ["Light", "Dark"];
const langs = ["English", "Urdu"];

export default ({ onSignInSuccess, navigation, route }) => {
  const [form, setForm] = useState({ ...dto });
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingApp, setLoadingApp] = useState(false);
  const [price, setPrice] = useState(500);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [appId, setAppId] = useState(0);
  const [selectedLangIndex, setSelectedLangIndex] = useState(new IndexPath(0));
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(
    new IndexPath(0)
  );
  const LoadingIndicator = (props) => (
    <Layout style={[props.style, styles.indicator]}>
      {loading ? <Spinner size="small" /> : <Icon {...props} name="save" />}
    </Layout>
  );

  const onFormChange = (key, value) => {
    setErrors({
      ...errors,
      [key]: null,
    });
    setForm({
      ...form,
      [key]: value,
    });
  };

  const getApp = async () => {
    try {
      setLoadingApp(true);
      const { data: appData } = await app.get();

      const [appSettings = {}] = appData;
      // console.log({ appSettings });
      if (!appSettings.AppId) {
        navigation.navigate("SignUp", { account: false });
      } else {
        const { AppId, AppTheme, AppLang, ...restApp } = appSettings;

        const existingFormValues = Object.keys(restApp).reduce((sum, key) => {
          const formedKey = convertToUnderScoreCase(key.substring(3));
          sum[formedKey] = restApp[key];
          return sum;
        }, {});
        setForm({ ...form, ...existingFormValues });
        setAppId(AppId);
        const themeIndex = themes.findIndex(
          (theme) => AppTheme === theme.toLowerCase()
        );
        if (themeIndex !== -1) {
          setSelectedThemeIndex(new IndexPath(themeIndex));
        }
        const langIndex = langs.findIndex((lang) =>
          lang.toLowerCase().includes(AppLang)
        );
        if (langIndex !== -1) {
          setSelectedLangIndex(new IndexPath(langIndex));
        }

        // console.log({ existingFormValues });
      }
    } catch (error) {
      ToastAndroid.show("Failed to load app!", ToastAndroid.SHORT);

      setMessage("Failed to load app");
    } finally {
      setLoadingApp(false);
    }

    // setTried(true);
  };

  useEffect(() => {
    console.log(route);
    if (route.params && route.params.account) {
      getApp();
    }
  }, [route]);

  const saveSuiteType = async () => {
    await suiteType.create({
      name: "Regular",
      price,
      discount: 0,
      description: "Regular Suite",
    });
  };

  const onHndleClick = async () => {
    const { isValid, errors } = validateSignUpForm(
      appId ? form : { ...form, price }
    );

    if (!isValid) {
      setErrors({ ...errors });
      return false;
    }
    await AsyncStorage.removeItem("passcode");
    if (!appId) {
      saveSuiteType();
    }
    try {
      setLoading(true);
      const { insertId, rowsAffected } = await app.insertOrUpdate({
        ...form,
        theme: themes[selectedThemeIndex.row].toLowerCase(),
        lang: langs[selectedLangIndex.row].toLowerCase().substring(0, 2),
      });
      if (insertId || rowsAffected) {
        const { account } = route.params || {};
        ToastAndroid.show(
          `Information successfully ${account ? "Updated" : "Saved"}!`,
          ToastAndroid.SHORT
        );

        navigation.navigate("Entry", { register: true });
      }
    } catch (error) {
      console.log(error);
      setMessage(`Information Failed to ${account ? "Update" : "Save"}!`);
      ToastAndroid.show(
        `Information Failed to ${account ? "Update" : "Save"}!`,
        ToastAndroid.SHORT
      );
    } finally {
      setLoading(false);
    }
  };
  const renderSecurityIcon = (props) => (
    <TouchableWithoutFeedback
      onPress={() => setSecureTextEntry(!secureTextEntry)}
    >
      <Icon {...props} name={secureTextEntry ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );

  const getCommonProps = (field) => {
    return {
      onChangeText: (value) => onFormChange(field, value),
      value: `${form[field]}`,
      caption: errors[field],
      status: errors[field] && "danger",
      style: styles.input,
    };
  };

  return (
    <Layout style={styles.constainer}>
      <ScrollView>
        <Layout style={styles.centered}>
          <Text category="h6">Sign Up رجسٹر کریں</Text>
          {loadingApp && <Spinner />}
        </Layout>
        <Layout style={styles.centered}>
          <Text status={"danger"}>{message}</Text>
        </Layout>
        <Input
          placeholder="Brand Name - دکان کا نام"
          {...getCommonProps("brand_name")}
        />
        <Input
          placeholder="User Name - صارف کا نام"
          {...getCommonProps("user_name")}
        />
        <Input
          placeholder="Pass Code - پاس کوڈ"
          keyboardType="numeric"
          maxLength={5}
          accessoryRight={renderSecurityIcon}
          secureTextEntry={secureTextEntry}
          {...getCommonProps("pass_code")}
        />
        {!appId && (
          <Input
            placeholder="Suit Price - سوٹ قیمت"
            label="Suit Price - سوٹ قیمت"
            keyboardType="numeric"
            maxLength={5}
            value={`${price}`}
            caption={errors.price}
            status={errors.price && "danger"}
            style={styles.input}
            onChangeText={(val) => setPrice(val)}
          />
        )}

        <Input
          placeholder="Phone - فون"
          {...getCommonProps("phone")}
          keyboardType="phone-pad"
        />

        <Input
          placeholder="Location - مقام دکان"
          {...getCommonProps("location")}
        />
        <Input placeholder="Address - پتہ" {...getCommonProps("address")} />

        <Select
          style={styles.input}
          selectedIndex={selectedLangIndex}
          onSelect={(index) => setSelectedLangIndex(index)}
          value={langs[selectedLangIndex.row]}
          label="Language - زبان"
        >
          {langs.map((them, index) => (
            <SelectItem title={them} key={`${them}-${index}`} />
          ))}
        </Select>

        <Select
          style={styles.input}
          selectedIndex={selectedThemeIndex}
          onSelect={(index) => setSelectedThemeIndex(index)}
          value={themes[selectedThemeIndex.row]}
          label="Theme - تھیم"
        >
          {themes.map((them, index) => (
            <SelectItem title={them} key={`${them}-${index}`} />
          ))}
        </Select>

        <Button
          onPress={onHndleClick}
          style={styles.input}
          accessoryLeft={LoadingIndicator}
        >
          Save
        </Button>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    margin: 10,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
