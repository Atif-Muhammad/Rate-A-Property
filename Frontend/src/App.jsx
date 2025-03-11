import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/notfound/NotFound";
import { Sign_In } from "./pages/authentication/Sign_In";
import { Sign_Up } from "./pages/authentication/Sign_Up";
// import { NewPost } from "./components/NewPost";
import CommentSection from "./components/Card/CommentSection";
import { Header } from "./pages/header/Header";
import { LayoutForLanding } from "./pages/LayoutForLanding";
import { Notifications } from "./pages/notification/Notifications";
import { Messages } from "./pages/messages/Messages";
// import State from "./context/state";

function App() {
  return (
    <>
      {/* <State> */}
      <BrowserRouter>
        <Header />
        <Routes>
          {/* using outlet in layout */}
          <Route path="/" element={<LayoutForLanding />}>
            <Route index element={<Home />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/messages" element={<Messages />} />
          </Route>
          {/* others components */}
          {/* <Route path="/newPost" element={<NewPost />} /> */}
          <Route path="/commentsection/:postId" element={<CommentSection />} />
          <Route path="/signin" element={<Sign_In />} />
          <Route path="/signup" element={<Sign_Up />} />
        </Routes>
      </BrowserRouter>
      {/* </State> */}
    </>
  );
}

export default App;