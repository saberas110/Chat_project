import LeftSide from "../../components/leftSideHome/LeftSide.tsx";
import usePresence from "../../hooks/presence/usePresence.ts";
import useGetUser from "../../hooks/getUser/useGetUser.tsx";


export default function Home(){
const {loading, user} = useGetUser()
usePresence()


     if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading...</span>
            </div>
        );
         }


    return(
        <>
                <LeftSide />

        </>
    )
}