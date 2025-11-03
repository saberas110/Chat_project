import React, {createContext, useContext, useEffect, useState} from "react";
import {apiChatList, apiContacts, apiConversation} from "../services/api.ts";
import useGetUser from "../hooks/getUser/useGetUser.tsx";

interface IchatProviderProps {
    children: React.ReactNode
}

interface IChatList {
    id: number,
    name: string,
    lastMessage: string
    time: string,
    unread: number,
    avatar: string

}

interface IContacts {
    id: number,
    contact_user: string,
    nickname: string,
    last_seen: string,
    is_online: boolean,
    avatar: string
}


interface IChatContex {
    chatList: IChatList[],
    // setChatList: IChatList[],
    contacts: IContacts[],
    getConversationId: (id:string)=>Promise<string>

}


const chatContext = createContext({} as IChatContex)

export const useChatContext = () => useContext(chatContext)


export default function ChatProvider({children}: IchatProviderProps) {
    const {lodding, user} = useGetUser()
    const [chatList, setChatList] = useState<IChatList[]>([])
    const [contacts, setContacts] = useState<IContacts[]>([])
    const [activeChat, setActiveChat] = useState(null)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState([])




async function getConversationId(id:string){
  const res = await apiConversation(id)
        setConversationId(res)
    return res
}

    useEffect(() => {
        const getContacts = async ()=>{
            await apiContacts().then(res=>{
                setContacts(res)
            })
        }
        getContacts()
    }, []);







        return (
            <chatContext.Provider value={{messages, setMessages, chatList, setChatList, contacts, setContacts, getConversationId, activeChat, setActiveChat}}>

                {children}

            </chatContext.Provider>
        )
    }