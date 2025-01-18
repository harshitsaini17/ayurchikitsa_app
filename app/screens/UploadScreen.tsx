import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Svg, Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { constants } from "@/constants";

// Upload Icon SVG Component
const UploadIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 12L12 8M12 8L8 12M12 8V16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Gallery Icon SVG Component
const GalleryIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UploadScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setError(null);
        setResult(null);
      }
    } catch (err) {
      setError("Failed to pick image");
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fileName = image.split("/").pop() || "image.jpg";
      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === "ios" ? image.replace("file://", "") : image,
        type: "image/jpeg",
        name: fileName,
      });

      const response = await fetch("https://34ab-2409-40d4-2002-aefe-b54d-6590-e0d9-3a43.ngrok-free.app/predict/combined/img", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);

      const data = await response.json();
      setResult(data.annotated_image);
      setImage(data.annotated_image);

      console.log(data);
      
      await fetch("http://172.31.118.105:3000/api/image", {
        method: "POST",
        body: JSON.stringify({ imageUrl: data.annotated_image, userId: constants.chatUserId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F8FAFC",
      padding: 20,
    },
    uploadArea: {
      width: "90%",
      aspectRatio: 4/3,
      backgroundColor: "#F1F5F9",
      borderRadius: 16,
      borderWidth: 2,
      borderColor: "#E2E8F0",
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      overflow: "hidden",
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#6366F1",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginVertical: 8,
      width: "90%",
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 12,
    },
    disabledButton: {
      backgroundColor: "#CBD5E1",
    },
    errorText: {
      color: "#EF4444",
      marginTop: 12,
      textAlign: "center",
      fontSize: 14,
    },
    resultText: {
      color: "#10B981",
      marginTop: 12,
      textAlign: "center",
      fontSize: 14,
      fontWeight: "500",
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 12,
    },
    placeholderText: {
      color: "#64748B",
      fontSize: 16,
      textAlign: "center",
      marginTop: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.uploadArea}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={{ alignItems: "center" }}>
            <GalleryIcon />
            <Text style={styles.placeholderText}>
              Tap to select an image{"\n"}from your gallery
            </Text>
          </View>
        )}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.button, (!image && styles.disabledButton)]} 
        onPress={pickImage} 
        disabled={loading}
      >
        <GalleryIcon />
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, (!image || loading) && styles.disabledButton]}
        onPress={uploadImage}
        disabled={!image || loading}
      >
        <UploadIcon />
        <Text style={styles.buttonText}>
          {loading ? "Uploading..." : "Upload Image"}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {result && (
        <Text style={styles.resultText}>Upload successful! Image processed and saved.</Text>
      )}
    </View>
  );
};