import {X, Search} from "lucide-react";
import {useChatContext} from "../../context/ChatContext.tsx";
import {useState} from "react";
import AddContact from "./AddContact.tsx";
import NotExistsError from "./NotExistsError.tsx";


function ContactsPanel({onClose, onContactSelect}) {

    const {contacts} = useChatContext()
    const [showAddContact, setShowAddContact] = useState(false)
    const [showExistsError, setShowExistsError] = useState(false)

    return (
        <div className="w-80 border-r border-gray-300 flex flex-col bg-white">
            {/* هدر پنل مخاطبین */}
            <div className="p-3 flex items-center border-b border-gray-300">
                <button
                    onClick={onClose}
                    className="mr-2 p-2 hover:bg-gray-200 rounded-full"
                >
                    <X size={20}/>
                </button>
                <h2 className="flex-1 text-lg font-semibold text-center">Contacts</h2>
            </div>


            <div className="p-3">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Search contacts"
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none"
                    />
                </div>
            </div>


            <div className="flex-1 overflow-y-auto">
                {contacts?.map((contact) => (
                    <div
                        key={contact.id}
                        onClick={() => onContactSelect(contact)}
                        className="flex items-center p-3 cursor-pointer border-b border-gray-200 hover:bg-gray-50"
                    >
                        <img
                            src={contact.avatar}
                            alt={contact.nickname}
                            className="w-12 h-12 rounded-full mr-3"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">{contact.name}</h3>
                            <p className="text-xs text-gray-500">{contact.last_Seen}</p>
                        </div>
                    </div>
                ))}
            </div>


            <div className="p-4 border-t border-gray-300">
                <button
                    onClick={()=>setShowAddContact(true)}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                    Add Contact
                </button>
            </div>
            {showAddContact && (
                <AddContact  showAddContact={setShowAddContact} showError={setShowExistsError} />
            )}
            {showExistsError && (
                <NotExistsError showError={setShowExistsError} />
            )}

        </div>
    );
};

export default ContactsPanel;