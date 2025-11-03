import {useEffect, useRef, useState} from "react";
import {useChatContext} from "../../context/ChatContext.tsx";


export default function useChat(conversationId: null, otherUserId: null) {

    console.log('start usechat')
    const wsRef = useRef<WebSocket | null>(null);

    const {messages, setMessages} = useChatContext()


    useEffect(() => {

        if (!conversationId && !otherUserId) return;

        let WS_URL = ''

        if (conversationId) {

            WS_URL = `ws://localhost:8000/ws/chat/${conversationId}/`
        } else {
            WS_URL = `ws://localhost:8000/ws/chat/user/${otherUserId}/`
        }


        const ws = new WebSocket(WS_URL)

        wsRef.current = ws

        ws.onopen = () => {
            console.log('open web socket')
            const msg_data = {
                type: 'read_messages',
            }
            ws.send(JSON.stringify(msg_data))

        }

        ws.onmessage = (event) => {


            try {
                const data = JSON.parse(event.data)

                if (data.type === 'init_message') {
                    setMessages(data.messages)
                } else if (data.type === 'new_message') {

                    setMessages(prevState => [...prevState, data.message])
                    const msg_data = {
                        type: 'read_messages',
                    }
                    ws.send(JSON.stringify(msg_data))

                }

            } catch (err) {
                console.log('error is :', err)
            }
        }

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = (event) => {
            setMessages([])
            console.log('socket closed:', event.code, event.reason)
        }

        return () => {
            console.log("Closing old chat socket...");
            wsRef.current?.close()
        }


    }, [conversationId, otherUserId]);

    const sendMessage = (text: string) => {
        const ws = wsRef.current
        if (!ws) {
            console.warn('WebSocket not connected yet!')
            return
        }
        if (ws.readyState === WebSocket.OPEN) {
            const messageData = {
                type: "chat_message",
                messages: text
            }
            ws.send(JSON.stringify(messageData))
        } else {
            console.warn("WebSocket is not open:", ws.readyState)
        }
    }

    return {sendMessage}
}