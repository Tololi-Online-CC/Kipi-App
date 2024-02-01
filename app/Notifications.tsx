import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { SafeAreaView, View } from 'react-native';

export default function Notifications() {
    const [messages, setMessages] = useState<IMessage[]>([]) // Explicitly define the type as IMessage[]

    useEffect(() => {
        setMessages([
            {
                _id: 1,
                text: 'Last Data update: 31 January 2024',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'Edilson Zau',
                },
            },
        ])
    }, [])

    const onSend = useCallback((newMessages: IMessage[] = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, newMessages),
        )
    }, [])

    return (
        <View style={{flex: 1}}>
            <GiftedChat
                messages={messages}
                onSend={newMessages => onSend(newMessages)}
                user={{
                    _id: 1,
                }}
            />
        </View>
    )
}
