import React, { useState, useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import * as Localization from "expo-localization";
import i18n from "i18n-js";

import {
  ApplicationProvider,
  IconRegistry,
  Layout,
} from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { mapping, light, dark } from "@eva-design/eva";

import Landing from "./src";
import { en, ur } from "./src/utils/locales";
import { LocalizationContext } from "./src/context";
// Set the key-value pairs for the different languages you want to support.

i18n.translations = {
  en,
  ur,
};
// Set the locale once at the beginning of your app.
i18n.locale = "en";
// When a value is missing from a language it'll fallback to another language with the key present.
i18n.fallbacks = true;

const themes = {
  light,
  dark,
};

const App = () => {
  const [locale, setLocale] = useState(Localization.locale);
  const [theme, setTheme] = useState("light");
  const localizationContext = useMemo(
    () => ({
      t: (scope, options) => i18n.t(scope, { locale, ...options }),
      locale,
      setLocale,
      isRTL: locale.includes("ur"),
      theme,
      setTheme,
    }),
    [locale, theme]
  );

  return (
    <>
      <LocalizationContext.Provider value={localizationContext}>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider mapping={mapping} theme={themes[theme]}>
          <Layout style={styles.container}>
            <Landing />
          </Layout>
        </ApplicationProvider>
      </LocalizationContext.Provider>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
});

export default App;
