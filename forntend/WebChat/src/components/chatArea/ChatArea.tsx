import useChat from "../../hooks/chat/useChat.ts";
import {useEffect, useRef, useState} from "react";
import useLastSeen from "../../hooks/lastSeen/useLastSeen.ts";
import useBotChat from "../../hooks/chat/useBotChat.ts";
import {useChatContext} from "../../context/ChatContext.tsx";
import { Paperclip, Smile, Send, Image as ImageIcon } from 'lucide-react';




const ChatArea = ({activeChat}) => {


    const lastSeen = useLastSeen(activeChat.last_seen)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [otherUserId, setOtherUserId] = useState<string | null>(null)
    const messageContainerRef = useRef<HTMLDivElement | null>(null)
    const messageEndRef = useRef<HTMLDivElement | null>(null)
    const {messages, setMessages}= useChatContext()
    const [text, setText] = useState('')
    const [isBot, setIsBot] = useState(false)
    const {sendMessage: sendUserMessage} = useChat(
        isBot ? null : conversationId,
        isBot ? null : otherUserId
    )

    const {sendMessage: sendBotMessage} = useBotChat(isBot)

    console.log('messages is ', messages)

    useEffect(() => {

        if (!activeChat) return

        if (activeChat.is_bot) {
            setIsBot(true)
            setConversationId(null)
            setOtherUserId(null)



    }else if ('unread' in activeChat) {
            setIsBot(false)
            setConversationId(activeChat.id)
            setOtherUserId(null)
        } else {
            setIsBot(false)
            setOtherUserId(activeChat.contact_user)
            setConversationId(null)
        }


    }, [activeChat]);

   useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);



    const handleSend = () => {
       if(!text.trim()) return
        if (isBot){
            sendBotMessage(text)
            setText('')
        }else {
            sendUserMessage(text)
            setText('')
        }
    }

  const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // ایجاد URL موقت برای نمایش عکس
            const imageUrl = URL.createObjectURL(file);

            // فراخوانی تابع برای ارسال عکس
            handleSendImage(imageUrl, file);
        }
    };

  const handleSendImage = (imageUrl, file) => {
        // اینجا می‌تونید عکس رو به سرور ارسال کنید
        // برای نمونه، یک پیام با نوع عکس ایجاد می‌کنیم
        const imageMessage = {
            id: Date.now(),
            text: '',
            image: imageUrl,
            isMe: true,
            type: 'image',
            created_at: new Date().toLocaleTimeString('fa-IR', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
}


    if (!activeChat) {
        return (
            <div
                className="flex-1 flex items-center justify-center"
                style={{
                    backgroundImage:
                        "url('https://telegram.org/img/tl_background_pattern.png'), linear-gradient(to top left, #e0fdd7, #a3d9c9)",
                    backgroundBlendMode: "overlay",
                    backgroundSize: "cover",
                }}
            >
                <p className="text-gray-500">یک مخاطب را انتخاب کنید</p>
            </div>
        );
    }

  return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-3 border-b border-gray-300 flex items-center">
                <img
                    src={activeChat.avatar}
                    alt={activeChat.name}
                    className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                    <h3 className="font-semibold">{activeChat.name}</h3>
                    {activeChat?.is_online ?
                        <p className="text-xs text-gray-500">آنلاین</p> :
                        <p className="text-xs text-gray-500">{lastSeen}</p>
                    }
                </div>
            </div>

            {/* Messages Area */}
            <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col-reverse">
                <div className="space-y-4 flex flex-col-reverse">
                    <div className="space-y-4">
                        {messages?.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                        message.isMe
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                    }`}
                                >
                                    {/* نمایش عکس اگر پیام از نوع عکس باشد */}
                                    {message.images && message.images.map(image=> (
                                        <div className="mb-2 ">
                                            <img
                                                src={image}
                                                alt="uploaded"
                                                className="max-w-full h-auto rounded-lg"
                                            />
                                        </div>
                                    ))}

                                    {/* نمایش متن اگر وجود دارد */}
                                    {message.text && (
                                        <p className="text-sm">{message.text}</p>
                                    )}

                                    {/* زمان ارسال */}
                                    <p className={`text-xs mt-1 ${message.isMe ? 'text-blue-100' : 'text-gray-500'} text-left`}>
                                        {message.created_at}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messageEndRef}/>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-300">
                <div className="flex items-center">
                    {/* Button for attaching files */}
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            id="image-upload"
                        />
                        <button
                            className="p-2 text-gray-500 hover:text-gray-700"
                            onClick={() => document.getElementById('image-upload').click()}
                        >
                            <ImageIcon size={20} />
                        </button>
                    </div>

                    <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Paperclip size={20}/>
                    </button>

                    <input
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                        type="text"
                        value={text}
                        placeholder="Type a message..."
                        className="flex-1 mx-2 px-4 py-2 rounded-full bg-gray-100 focus:outline-none"
                    />

                    <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Smile size={20}/>
                    </button>

                    <button
                        onClick={handleSend}
                        className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    >
                        <Send size={20}/>
                    </button>
                </div>
            </div>
        </div>
    );

            };
  export default ChatArea