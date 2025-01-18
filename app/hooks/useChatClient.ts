import { useEffect, useState } from "react"
import { StreamChat } from "stream-chat"
import { constants } from '../constants';


const API_KEY = constants.chatApiKey // Replace with your Stream API key

export const useChatClient = (userId: string, userToken: string) => {
  const [client, setClient] = useState<StreamChat | null>(null)

  useEffect(() => {
    const chatClient = new StreamChat(API_KEY)

    const connectUser = async () => {
      await chatClient.connectUser(
        { id: userId },
        userToken // Token generated on your server
      )
      setClient(chatClient)
    }

    connectUser()

    return () => {
      chatClient.disconnectUser()
    }
  }, [userId, userToken])

  return client
}
