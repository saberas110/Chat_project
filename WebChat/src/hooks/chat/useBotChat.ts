import {useEffect, useRef, useState} from "react";
import {useChatContext} from "../../context/ChatContext.tsx";


export default function useBotChat(isActive) {



    const wsRef = useRef<WebSocket | null>(null)

    const {messages, setMessages} = useChatContext()

    useEffect(() => {

            if (!isActive) {
                if (wsRef.current) {
                    console.log("Closing bot socket (inactive)...");
                    wsRef.current.close();
                    wsRef.current = null;
                }
                return;
            }


            let WS_URL = 'ws://localhost:8000/ws/bot/'

            const ws = new WebSocket(WS_URL)
            wsRef.current = ws
            ws.onopen = () => {
                console.log('Open WebSocket for chat bot')
            }
            ws.onmessage = (event) => {

                try {
                    const data = JSON.parse(event.data)


                    if (data.type==='init_message'){
                        data.message?.map(msg=>{
                            console.log('task_id', msg)
                           return  msg.text = `${msg.text}-->task_id: ${msg.task_id}---status: ${msg.status}`
                        })
                        setMessages(data.message)
                    } else if (data.type === 'guide') {
                        console.log('messages is', messages)
                        setMessages(prevState => prevState ? [...prevState, data.message] : [data.message])
                    } else if (data.type==='task_started'){
                        setMessages(prev=>[...prev, data.message])

                    }else if (data.type==='generated_images'){

                            setMessages(prev=>[...prev, data.message])
                    }else if(data.type==='task_result'){
                         data.message.text = `${data.message.text}---->${data.message.task_id}---status:${data.message.status}`

                        setMessages(prev=>[...prev, data.message])
                    }else if (data.type==='all_tasks'){
                        data.message?.map(msg=>{
                           return  msg.text = `${msg.text}-->task_id: ${msg.task_id}---status: ${msg.status}`
                        })
                        console.log('data all ', data.message)
                        setMessages(prev=>data.message)
                    }




                } catch (error) {
                    console.log(error)
                }
            }
            ws.onerror = (error) => {
                console.error("WebSocket error:", error)
            }

            ws.onclose = () => {
                console.log("ws.onclose old chat_bot socket...");
                setMessages([])
            }

            return () => {
                console.log("Closing old chat_bot socket...");
                setMessages([])
                wsRef.current?.close()
            }

        }
        , [isActive])


    const sendMessage = (text:string)=>{
        const ws = wsRef.current
        if (!ws){
            console.warn('you want send message but WS not connected yet')
            return
        }
        if(ws.readyState===WebSocket.OPEN){
                let type = ''
            const type_msg = text.split('=')
            console.log('type_msg', type_msg)
            switch (type_msg[0]){
                case "print":
                        type = 'print_text'
                        break
                case "task":
                    type = 'task_result'
                    break
                case "all":
                    type = 'all_tasks'
                    break
            }
            const messageData = {
                type: type,
                messages: type_msg[1] || ''
            }
            ws.send(JSON.stringify(messageData))
        }else {
            console.warn("WebSocket is not open:", ws.readyState)
        }
    }
    return { sendMessage }
}