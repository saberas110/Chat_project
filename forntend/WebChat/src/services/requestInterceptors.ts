import axios from "axios";


export async function getCSRFToken(instance):Promise<string | null> {
    try {
        const response = await instance.get('accounts/csrf')
        return response.data?.csrfToken || getCookie('csrftoken')
    }catch (error){
         console.error("Error getting CSRF token:", error);
    return null;
    }

}


export  function CSRFInteceptors(instance) {

    instance.interceptors.request.use(async (config) => {
        if (config.url?.includes('csrf')) {
            return config
        }
        let csrfToken = getCookie("csrftoken")
        if (!csrfToken) {
            csrfToken = await getCSRFToken(instance)
        }
        if (csrfToken){
            config.headers["X-CSRFToken"] = csrfToken
        }
        return config
    })

}


export default function RefreshInterceptors(instance){

    instance.interceptors.response.use(
        (response)=>response,
        async (error)=>{
            const originRequest = error.config

            if (
                originRequest.url.includes('token/refresh') ||
                window.location.href === 'http://localhost:5173/'
            ){
                return Promise.reject((error))
            }



            if (error.response?.status === 401){
                originRequest._retry = true
                try {
                    await axios.post('',{},{withCredentials:true})
                    return instance(originRequest)
                }catch (refreshError){
                    console.log('Refresh token expired. redirecting to login')
                    window.location.href = '/'
                }
            }
            return Promise.reject(error)
    })


}

