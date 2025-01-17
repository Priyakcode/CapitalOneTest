import React, { useState } from 'react';
import { View, Button, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

const CameraScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      mediaTypes: 'Images',
    });

    if (!result.canceled) {
      try {
        const asset = await MediaLibrary.createAssetAsync(result.uri);
        const album = await MediaLibrary.getAlbumAsync('Expo');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('Expo', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
        }

        setImages((prevImages) => [...prevImages, asset.uri]);
      } catch (error) {
        console.error('Error saving photo to gallery', error);
      }
    } else {
      console.log('User canceled camera');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ padding: 20 }}>
        <Button title="Open Camera" onPress={openCamera} />
      </View>
      <Button
        title="View Captured Photos"
        onPress={() => navigation.navigate('Gallery', { images })}
      />
    </View>
  );
};

const GalleryScreen = ({ navigation }) => {
  const images = navigation.getParam('images', []);

  return (
    <ScrollView contentContainerStyle={styles.galleryContainer}>
      {images.length === 0 ? (
        <View style={styles.messageContainer}>
          <Button title="No Images Captured" disabled />
        </View>
      ) : (
        images.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={styles.image}
          />
        ))
      )}
    </ScrollView>
  );
};

const AppNavigator = createStackNavigator(
  {
    Camera: CameraScreen,
    Gallery: GalleryScreen,
  },
  {
    initialRouteName: 'Camera',
  }
);

export default createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  galleryContainer: {
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 200,
    height: 200,
    margin: 10,
  },
  messageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
});
