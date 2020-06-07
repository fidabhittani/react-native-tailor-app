import React, { useState, useEffect, useRef } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { ToastAndroid } from "react-native";
import { Spinner } from "@ui-kitten/components";

import { Camera } from "expo-camera";
export default function Cam({ onTake, onClose }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [taking, setTaking] = useState(false);
  const cameraRef = useRef(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const onTakePicture = async () => {
    if (cameraRef && cameraRef.current) {
      try {
        setTaking(true);
        let photo = await cameraRef.current.takePictureAsync();
        onTake(photo);
      } catch (error) {
        ToastAndroid.show(
          "Failed to take picture, try again!" + error,
          ToastAndroid.SHORT
        );
        console.log(error);
      } finally {
        setTaking(false);
      }
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);
  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <Camera style={{ flex: 1 }} type={type} ref={cameraRef}>
        <View style={styles.camactions}>
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: "flex-end",
              alignItems: "center",
            }}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <Text style={{ fontSize: 18, color: "white" }}>Flip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: "flex-end",
              alignItems: "center",
            }}
            onPress={() => onClose()}
          >
            <Text style={{ fontSize: 18, color: "red" }}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignSelf: "center", marginBottom: 20 }}
            onPress={onTakePicture}
          >
            <View style={styles.takeBtnOuter}>
              {taking ? <Spinner /> : <View style={styles.takeBtnInner} />}
            </View>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100,
  },
  camactions: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  takeBtnOuter: {
    borderWidth: 2,
    borderRadius: 10000,
    borderColor: "white",
    height: 50,
    width: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  takeBtnInner: {
    borderWidth: 2,
    borderRadius: 10000,
    borderColor: "white",
    height: 40,
    width: 40,
    backgroundColor: "yellow",
  },
});
