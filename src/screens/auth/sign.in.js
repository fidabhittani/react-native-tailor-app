import React, { useState, useEffect } from "react";
import {
  Text,
  Button,
  Layout,
  Input,
  Icon,
  Spinner,
} from "@ui-kitten/components";
import { StyleSheet, AsyncStorage, Image } from "react-native";

const validateForm = (form) => {
  let errors = {};
  if (!form.username) {
    errors["username"] = "Username is Required صارف نام ضروری ہے";
  }

  if (!form.passcode) {
    errors["passcode"] = "Pass Code is Required پاس کوڈ ضروری ہے";
  }
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

export default ({ app: appIn = {}, navigation, route }) => {
  const [username, setUsername] = useState("");
  const [app, setApp] = useState({});
  const [passcode, setPasscode] = useState("");
  const [errs, setErrs] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const LoadingIndicator = (props) => (
    <Layout
      style={{
        ...props.style,
        ...styles.centered,
        backgroundColor: "transparent",
      }}
    >
      {loading ? <Spinner size="small" /> : <Icon {...props} name="save" />}
    </Layout>
  );

  const checkCode = async () => {
    setLoading(true);
    const passcode = await AsyncStorage.getItem("passcode");
    setLoading(false);
    if (passcode == appIn.AppPassCode) {
      setPasscode(Number(passcode));
      navigation.navigate("Home");
    }
  };

  useEffect(() => {
    if (appIn.AppId) {
      checkCode();
      setApp(appIn);
      setUsername(appIn.AppUserName);
    }
  }, [appIn]);

  const storeData = async (key, passcode) => {
    try {
      await AsyncStorage.setItem(key, passcode);
    } catch (error) {
      console.log("erro", error);
    }
  };

  const onHndleClick = async () => {
    const { isValid, errors } = validateForm({ username, passcode });

    if (!isValid) {
      setErrs(errors);
      return false;
    }

    const { AppUserName, AppPassCode } = app;

    if (AppUserName == username && AppPassCode == passcode) {
      await storeData("passcode", passcode);
      navigation.navigate("Home");
    } else {
      setMessage("Wrong Username or Passcode");
    }
  };

  return (
    <Layout style={styles.constainer}>
      <Layout style={styles.centered}>
        <Image
          style={{ width: 100, height: 100 }}
          source={require("../../../assets/brand/logo_transparent.png")}
        />

        <Text category="h6">Sign In سائن ان</Text>
        <Text
          style={{ justifyContent: "center" }}
          appearance="hint"
          status="danger"
        >
          {message}
        </Text>
      </Layout>

      <Input
        style={styles.input}
        placeholder="Username"
        value={username}
        caption={errs.username}
        status={errs.username && "danger"}
        disabled={true}
        onChangeText={(nextValue) => setUsername(nextValue)}
      />
      <Input
        style={styles.input}
        placeholder="Passcode"
        value={`${passcode}`}
        caption={errs.passcode}
        status={errs.passcode && "danger"}
        secureTextEntry={true}
        maxLength={5}
        keyboardType="numeric"
        onChangeText={(nextValue) => setPasscode(nextValue)}
      />

      <Button
        onPress={onHndleClick}
        accessoryLeft={LoadingIndicator}
        style={styles.input}
      >
        Sign In سائن ان
      </Button>
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
});
