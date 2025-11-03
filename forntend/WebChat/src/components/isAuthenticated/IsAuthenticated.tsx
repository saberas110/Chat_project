import useGetUser from "../../hooks/getUser/useGetUser.tsx";
import {Navigate, Outlet} from "react-router";


export default function IsAuthenticated(){

    const {user, loading} = useGetUser()


     if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading...</span>
            </div>
        );
         }


    if (user){
       return <Navigate to='/home' replace />
    }


    return <Outlet/>

}