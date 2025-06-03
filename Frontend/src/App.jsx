import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/notfound/NotFound";
import { Sign_In } from "./pages/authentication/Sign_In";
import { Sign_Up } from "./pages/authentication/Sign_Up";
// import { NewPost } from "./components/NewPost";
import CommentSection from "./components/CommentSection";
import { Header } from "./pages/header/Header";
import { LayoutForLanding } from "./pages/LayoutForLanding";
import { Notifications } from "./pages/notification/Notifications";
import { Messages } from "./pages/messages/Messages";
import { UserInfo } from "./pages/profile/UserInfo";
import { useQuery } from "@tanstack/react-query";
import { APIS } from "../config/Config";
import State from "./context/State";
import Dashboard from "./components/Analysis/Dashboard";

function App() {

  const { data } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const who = await APIS.userWho();
      const res = await APIS.getUser(who.data.id);
      const user = res.data;
      // console.log("user in app:", user);
      return user; 
    },
  });

  return (
    <>
      {/* <div className=" h-screen"> */}
        <State>
        <BrowserRouter>
          <Header />
          <Routes>
            {/* using outlet in layout */}
            <Route path="/" element={<LayoutForLanding />}>
              <Route index element={<Home />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path={`/profile/:user`} element={<UserInfo />} />
              <Route path="/messages" element={<Messages />} />
            </Route>
            {/* others components */}
            {/* <Route path="/newPost" element={<NewPost />} /> */}
            <Route path="/post/:postId" element={<CommentSection />} />
            <Route path="/dashboard/:postId" element={<Dashboard/>}/>
            <Route path="/signin" element={<Sign_In />} />
            <Route path="/signup" element={<Sign_Up />} />
          </Routes>
        </BrowserRouter>
        </State>
      {/* </div> */}
    </>
  );
}

export default App;
