import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import Signup from './components/Signup';
import Login from "./components/Login";

import Mainhero from "./components/home/Mainhero";
import Navbar from "./components/Navbar";
import Mindash from "./components/Dash/Mindash";
import Res from "./components/Dash/res";
import Dash from "./components/Dash/DAsh";
import ResourcesPage from "./components/Dash/reso/ResoPage";

function Layout() {
  const location = useLocation();
  const hideElementsOnRoutes = ["/signup","/login"]; 

  return (
    <>
      {!hideElementsOnRoutes.includes(location.pathname) && <Navbar />}
      
      <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Mainhero />} />
      <Route path="/dashboard" element={<Dash />} />
      <Route path="/res" element={<Res/>}/>
      <Route path="/resource" element={<ResourcesPage/>}/>
      <Route path="/dash" element={<Dash />} />
    </Routes>
      
   
    </>
  );
}

function App() {

  return (
    <BrowserRouter>
     
    <Layout/>
    </BrowserRouter>
  )
}

export default App
