import React, { useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import {
  Chat,
  OverlayProvider,
  Channel,
  MessageList,
  MessageInput,
} from "stream-chat-react-native"
import { useChatClient } from "../hooks/useChatClient"
import { constants } from "@/constants"
import { KeyboardAvoidingView, Platform } from 'react-native';
import { KeyboardCompatibleView } from 'stream-chat-react-native';

export const ChatScreen = () => {
  const userId = constants.chatUserId // Replace with your user ID
  const userToken = constants.chatUserToken // Replace with the token for this user
  const client = useChatClient(userId, userToken)

  const [channel, setChannel] = useState(null)

  useEffect(() => {
    const fetchChannel = async () => {
      if (client) {
        const channel = client.channel("messaging", "health_consultation", {
          members: ["patient_1", "expert_1"],
        })
        
        await channel.watch()
        setChannel(channel)
      }
    }

    fetchChannel()
  }, [client])

  if (!client || !channel) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <OverlayProvider>
      <Chat client={client}>
      <KeyboardCompatibleView
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 25}
    >
        <Channel channel={channel}>
          <MessageList />
          <MessageInput />
        </Channel>
        </KeyboardCompatibleView>
      </Chat>
    </OverlayProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

