import axios  from 'axios'
import CSRFInteceptors from "./requestInterceptors.ts";
import RefreshInterceptors from "./requestInterceptors.ts";


const Host = 'http://localhost:8000/'

function getCookie(name: string):string | null {
    const value = `;${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length == 2) return parts.pop()!.split(';').shift() || null
    return null
}


const api = axios.create({
    baseURL: Host,
    withCredentials: true,
})

CSRFInteceptors(api)
RefreshInterceptors(api)





export async function apiOtp(phone:string){
  try {
    const response = await api.post("accounts/otp", {
        'phone':phone
    });
    return response.data;
  } catch (error: any) {
    console.error("Error sending OTP:", error.response || null);
    throw error;
  }
}

export async function apiRegister(otp:string){
    try{
        const response = await api.post('accounts/register', {
            'otp_code':otp
        })
        return response.data
    }catch (error){
        console.error("Error sending OTP:", error.response || null);
    throw error;
    }
}





export async function apiChatList(){

    try {
        const response =await api.get('chat/cvs')
        return response.data
    }catch (error){
        console.error("Error sending OTP:", error.response || null)
        throw error
    }
}

export async function apiContacts(){

     try {
        const response =await api.get('chat/contacts')
        return response.data
    }catch (error){
        console.error("Error sending OTP:", error.response || null)
        throw error
    }
}

export async function apiConversation(id:string){
    try {
        const response = await api.post('chat/cv',{id})
        return response.data
    }catch (error){
        console.log('Error apiConversation is:', error.response || null)
        throw error
    }
}

export async function apiUser(){

        const response = await api.get('accounts/get/user')
        return response.data


}

export async function apiAddContact(name:string, phone_number:string){


        const response = await api.post('chat/addcontact', {
            'name': name,
            'phone_number': phone_number
        })
        return response.data
}



