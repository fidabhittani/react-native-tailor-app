import React, { useState, useEffect, useContext } from "react";
import { Layout } from "@ui-kitten/components";
import { StyleSheet } from "react-native";
import { Spinner } from "@ui-kitten/components";
import SignIn from "../auth/sign.in";

import database from "../../database";
import { AppModel } from "../../models";
import { LocalizationContext } from "../../context";
const app = new AppModel(database.getDatabase());

export default ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState({});
  // const [message, setMessage] = useState("");
  const { setLocale, setTheme } = useContext(LocalizationContext);

  const getApp = async () => {
    try {
      setLoading(true);
      const { data: appData } = await app.get();

      const [appSettings = {}] = appData;
      if (!appSettings.AppId) {
        navigation.navigate("SignUp");
      }
      setAppData(appSettings);
    } catch (error) {
      setMessage("Failed to load app" + JSON.stringify(error));
    } finally {
      setLoading(false);
    }

    // setTried(true);
  };
  useEffect(() => {
    getApp();
    console.log(route.name);
  }, [route]);

  useEffect(() => {
    if (appData.AppId) {
      const { AppLang, AppTheme } = appData;
      if (AppTheme && ["light", "dark"].includes(AppTheme)) {
        setTheme(AppTheme);
      }
      if (AppLang && ["en", "ur"].includes(AppLang)) {
        setLocale(AppLang);
      }
    }
  }, [appData]);

  if (loading) {
    return <Layout style={styles.loading}>{loading && <Spinner />}</Layout>;
  }
  return <SignIn app={appData} navigation={navigation} />;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
