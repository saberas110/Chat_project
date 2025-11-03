import { useState} from "react";
import { Menu, Edit3 } from "lucide-react";
import ContactsPanel from "../contactspanel/ContactsPanel.tsx";
import ChatArea from "../chatArea/ChatArea.tsx";
import {useChatContext} from "../../context/ChatContext.tsx";

export default function LeftSide() {
  const {chatList, activeChat, setActiveChat} = useChatContext()
  const [selectedUser, setSelectedUser] = useState(null);
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  console.log('chat list is;', chatList)


  const handleUserSelect = (chat) => {
    console.log('im from handle chat select contact is:', chat)
    setSelectedUser(chat.contact_user);
    setActiveChat(chat);
  };

  const handleContactSelect = (contact) => {
    console.log('im from handle contact select contact is:', contact)
    setActiveChat(contact);
    setSelectedUser(contact.contact_user);
    setIsContactsOpen(false);
  };


  return (
    <div className="h-screen w-screen flex">
      {/* سمت چپ */}
      <div className="w-80 border-r border-gray-300 flex flex-col bg-white relative">
        {/* هدر سرچ */}
        <div className="p-3 flex items-center">
          <button className="mr-2 p-2 hover:bg-gray-200 rounded-full">
            <Menu size={20} />
          </button>
          <input
            type="text"
            placeholder="Search"
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatList && (
              chatList?.map((chat) => (

            <div
              key={chat.id}
              onClick={() => handleUserSelect(chat)}
              className={`flex items-center p-3 cursor-pointer border-b border-gray-200
                ${selectedUser === chat.contact_user ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-sm">{chat.name}</h2>
                  <span className="text-xs text-gray-500">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 truncate max-w-[160px]">
                    {chat.last_message}
                  </p>
                  {chat.unread > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        <button
          onClick={() => setIsContactsOpen(true)}
          className="absolute bottom-4 right-4 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
        >
          <Edit3 size={24} />
        </button>
      </div>


      {isContactsOpen && (
        <ContactsPanel
          onClose={() => setIsContactsOpen(false)}
          onContactSelect={handleContactSelect}
        />
      )}

      {activeChat &&(
          <ChatArea activeChat={activeChat} />
      )}

    </div>
  );
}