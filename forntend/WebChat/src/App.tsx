import './App.css'
import {Route, Routes} from "react-router-dom";
import AuthApp from "./ pages/register/AuthApp.tsx";
import Home from "./ pages/home/Home.tsx";
import ChatProvider from "./context/ChatContext.tsx";
import AuthProvider from "./context/AuthContext.tsx";
import IsAuthenticated from "./components/isAuthenticated/IsAuthenticated.tsx";


function App() {


    return (
        <>

            <AuthProvider>
                <ChatProvider>
                    <Routes>
                        <Route path='/home' element={<Home/>}/>

                        <Route element={<IsAuthenticated/>}>
                            <Route path='/' element={<AuthApp/>}/>

                        </Route>


                    </Routes>
                </ChatProvider>
            </AuthProvider>


        </>
    )
}

export default App
