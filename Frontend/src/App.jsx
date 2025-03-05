import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/notfound/NotFound";
import { Sign_In } from "./pages/authentication/Sign_In";
import { Sign_Up } from "./pages/authentication/Sign_Up";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/signin" element={<Sign_In />} />
          <Route path="/signup" element={<Sign_Up />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
