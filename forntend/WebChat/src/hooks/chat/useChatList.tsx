// import {useEffect, useState} from "react";
// import {apiChatList} from "../../services/api.ts";
//
//
// export default function useChatList (){
//
//     const [chatList, setChatList] = useState<any[]>([])
//
//     useEffect(() => {
//
//          const getchatList = async ()=>{
//
//              try {
//                  const res = await apiChatList()
//                  setChatList(res)
//
//              }catch (error){
//
//                  console.log('error is:', error)
//              }
//
//
//          }
//         getchatList()
//
//     }, []);
//
//     return {chatList, setChatList}
//
// }