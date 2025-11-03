import {useState} from "react";
import {X, Search} from "lucide-react";
import {apiAddContact} from "../../services/api.ts";
import {useChatContext} from "../../context/ChatContext.tsx";

export default function AddContact({showAddContact, showError}) {

    const {chatList, setChatList} = useChatContext()
    const {setContacts} = useChatContext()
    const [newContact, setNewContact] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: ""
    })

    const handleAddContact = () => {

        const fullName = `${newContact.firstName} ${newContact.lastName}`.trim()
        const phone_number = `0${newContact.phoneNumber}`.trim()

        if (fullName != '' && phone_number != '') {


            apiAddContact(fullName, phone_number).then(res => {

                setContacts(prevState => {

                    const new_prev = prevState.filter(p => p.contact_user != res.contact_user)
                    return [...new_prev, res]
                })

                setChatList(prevChat => {
                    const old_chat = prevChat?.find(o=>o.contact_user===res.contact_user)
                    if (old_chat){
                        const new_chat = prevChat?.filter(p => p.contact_user != res.contact_user)
                        if (new_chat){
                            return [...new_chat, res]
                        }
                        return prevChat
                    }return prevChat




                })

                showAddContact(false)

            })
                .catch(error => {
                    console.log('error is:', error.response)
                    if (error.response.status === 404){
                        showAddContact(false)
                        showError(true)

                    }

                })

        }


    }

    const handleCancel = () => {
        showAddContact(false)
    }


    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-80 max-w-sm mx-4">
                {/* هدر مودال */}
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-center">New Contact</h3>
                </div>

                {/* محتوای مودال */}
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">First name</label>
                        <input
                            type="text"
                            name="contact-firstname"
                            autoComplete="given-name"
                            value={newContact.firstName}
                            onChange={(e) => setNewContact({...newContact, firstName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Enter first name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Last name</label>
                        <input
                            type="text"
                            name="contact-lastname"
                            autoComplete="family-name"
                            value={newContact.lastName}
                            onChange={(e) => setNewContact({...newContact, lastName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Enter last name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                        <div className="flex">
                            <div
                                className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l text-sm flex items-center">
                                +98
                            </div>
                            <input
                                type="tel"
                                name="contact-phone"
                                autoComplete="tel"
                                value={newContact.phoneNumber}
                                onChange={(e) => setNewContact({...newContact, phoneNumber: e.target.value})}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:border-blue-500"
                                placeholder="--- --- ----"
                            />
                        </div>
                    </div>
                </div>

                {/* دکمه‌های پایین */}
                <div className="p-4 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={handleCancel}
                        className="flex-1 py-2.5 text-gray-600 hover:bg-gray-100 rounded font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddContact}
                        disabled={!newContact.firstName.trim() || !newContact.phoneNumber.trim()}
                        className="flex-1 py-2.5 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    )
}


