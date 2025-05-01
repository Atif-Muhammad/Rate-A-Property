import context from "./context";
import { useState } from "react";

function State(props){
    const [userQuery, setUserQuery] = useState("")
    const [showNewPost, setShowNewPost] = useState(false);

    const updateShowNewPost = ()=>{
        setShowNewPost(true);
    }

    const contextValues = {showNewPost, updateShowNewPost, userQuery, setUserQuery};
    return (
        <context.Provider value={contextValues}>
            {props.children}
        </context.Provider>
    )


}
export default State;