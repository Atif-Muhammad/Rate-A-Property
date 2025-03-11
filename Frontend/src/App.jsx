import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/notfound/NotFound";
import { Sign_In } from "./pages/authentication/Sign_In";
import { Sign_Up } from "./pages/authentication/Sign_Up";
import { NewPost } from "./components/NewPost";
import CommentSection from "./components/Card/CommentSection";
// import State from "./context/state";

function App() {
  return (
    <>
          {/* <State> */}
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/signin" element={<Sign_In />} />
          <Route path="/signup" element={<Sign_Up />} />
          <Route path="/newPost" element={<NewPost />} />
          <Route path="/commentsection/:postId" element={<CommentSection />} />
        </Routes>
      </BrowserRouter>
          {/* </State> */}
    </>
  );
}

export default App;
