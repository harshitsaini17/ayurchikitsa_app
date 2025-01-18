import messaging from '@react-native-firebase/messaging';
import { Platform, Alert, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission({
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        provisional: false,
        sound: true,
      });
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } else {
      // On Android, permission is granted during app installation
      return await messaging().hasPermission();
    }
  } catch (error) {
    console.error('Permission request failed:', error);
    return false;
  }
};

const checkAndRequestPermission = async () => {
  try {
    const hasPermission = await messaging().hasPermission();
    
    if (hasPermission === messaging.AuthorizationStatus.NOT_DETERMINED) {
      return await requestNotificationPermission();
    }
    
    if (hasPermission === messaging.AuthorizationStatus.DENIED) {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications to receive important updates about your health analysis.',
        [
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openSettings();
              } else {
                IntentLauncher.startActivityAsync(
                  IntentLauncher.ActivityAction.NOTIFICATION_SETTINGS
                );
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
};

const registerDeviceForNotifications = async (client: { addDevice: (arg0: string, arg1: string, arg2: any) => any; }, userId: any) => {
  try {
    const hasPermission = await checkAndRequestPermission();
    if (hasPermission) {
      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);
      
      if (client) {
        await client.addDevice(fcmToken, 'firebase', userId);
        console.log('Device registered for notifications');
      }
    }
  } catch (error) {
    console.error('Failed to register device for notifications:', error);
  }
};

export { checkAndRequestPermission, registerDeviceForNotifications };
