import {useEffect, useState} from "react";
import {useChatContext} from "../../context/ChatContext.tsx";

const WS_URL: string = 'ws://localhost:8000/ws/presence/'

export default function usePresence() {
    const {setChatList, chatList, activeChat, setActiveChat} = useChatContext()
    const [pendingPresence, setPendingPresence] = useState([])

    useEffect(() => {
        const ws = new WebSocket(WS_URL)

        ws.onopen = () => console.log("presence websocket opened")
        ws.onmessage = (ev) => {

            const data = JSON.parse(ev.data)


            if (data.type === 'chat_list') {

                setChatList(data.conversations)

            } else if (data.type === 'new_chat') {

                setChatList(prevState => {
                    if (prevState===null){
                        return [data.conversation]
                    }
                    const conv = prevState?.find(conv => conv.contact_user === data.conversation.contact_user)


                    if (conv == null) {
                        return [data.conversation, ...prevState]
                    }


                    const newprev = prevState?.filter(c => c.contact_user != data.conversation.contact_user)
                    return [data.conversation, ...newprev]
                })

            } else if (data.type === 'read_message') {

                setChatList(prevState => {
                    if (prevState===null){
                        return [data.conversation]
                    }

                    const conv = prevState?.find(conv => conv.contact_user === data.conversation.contact_user)
                    if (conv == null) {
                        return [data.conversation, ...prevState]
                    }
                    const newprev = prevState?.filter(c => c.contact_user != data.conversation.contact_user)

                    return [data.conversation, ...newprev]

                })

            } else if (data.type === 'presence.update') {

                setPendingPresence(prev => [...prev, data]);

            }
        }

        ws.onclose = (event) => {
            console.log('socket closed:', event.code, event.reason)
        }


        return () => {
            ws.onclose = (ev) => {
                ws.close()
            }
        }


    }, [setChatList])


    useEffect(() => {
        if (pendingPresence.length === 0) return;

        setActiveChat(prevChat => {
            if (prevChat != null) {
                const new_activeChat = pendingPresence.find(p => p.user_id === prevChat.contact_user)
                if (!new_activeChat) return prevChat
                if (new_activeChat.status === 'online') {
                    return {...prevChat, is_online: true};
                } else if (new_activeChat.status === 'offline') {
                    return {...prevChat, is_online: false, last_seen: new Date()};
                }
            }
            return prevChat
        })

        setChatList(prevState =>{
            prevState?.map(cv => {
                const update = pendingPresence.find(p => p.user_id === cv.contact_user);
                if (!update) return cv;

                return {
                    ...cv,
                    is_online: update.status === 'online',
                    last_seen: update.status === 'offline' ? new Date() : cv.last_seen
                }


            })

        setActiveChat(prevChat => {
            if (!prevChat) return prevChat;
            const update = pendingPresence.find(p => p.user_id === prevChat.contact_user);
            if (!update) return prevChat;
            return {
                ...prevChat,
                is_online: update.status === 'online',
                last_seen: update.status === 'offline' ? new Date() : prevChat.last_seen
            }
        })

        return prevState

    })



        setPendingPresence([]);
    }, [pendingPresence, setChatList, setActiveChat]);

    return null;
}