import {useEffect, useState} from "react";
import {apiUser} from "../../services/api.ts";


export default function useGetUser(){

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)




        useEffect(() => {

        const getUser = async () =>{
            try{
                const res = await  apiUser()
                setUser(res)
            }catch (error){
                console.log('get user error is :', error)
            }finally {
                setLoading(false)
            }
        }
        getUser()
    }, []);



    return {loading, user}
}