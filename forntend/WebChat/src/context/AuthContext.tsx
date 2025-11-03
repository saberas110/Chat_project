import React, {createContext, useContext, useState} from "react";


interface IAuthProviderProps{
    children: React.ReactNode
}

interface IUser{
    phone_number:string
}


interface IAuthContext {
    user: IUser | null,
    lodding: boolean,

}

    const AuthContext = createContext({} as IAuthContext)

export const useAuthContext = ()=>{
    return useContext(AuthContext)
}


export default function AuthProvider({children}:IAuthProviderProps) {

    const [user, setUser] = useState(null)
    const [lodding, setLodding] = useState(true)




    return (
        <AuthContext.Provider value={{user, lodding}}>


            {children}

        </AuthContext.Provider>

    )

}