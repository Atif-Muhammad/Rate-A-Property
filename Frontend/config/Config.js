import axios from "axios";

const Baseurl = "http://localhost:3000/api";


const userWho = async (token)=>{
  try {
    const response = await axios.get(`${Baseurl}/user/userWho`,{withCredentials: true})
    return response
  } catch (error) {
    return error
  }
}

const signup = async (data) => {
  try {
    const response = await axios.post(`${Baseurl}/user/signup`, data, { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true });
    return response;
  } catch (error) {
    return error;
  }
};
const signin = async (data) => {
  try {
    const response = await axios.post(`${Baseurl}/user/signin`, { data }, { withCredentials: true });
    return response;
  } catch (error) {
    return error;
  }
};
const logout = async () => {
  try {
    const response = await axios.post(`${Baseurl}/user/logout`, {}, { withCredentials });
    return response
  } catch (error) {
    return error
  }
}

// Post related APIs
const getPosts = async ()=>{
  try {
    const response = await axios.get(`${Baseurl}/posts/getPosts`);
    return response
  } catch (error) {
    return error
  }
}

const getSinglePost = async (post_id)=>{
  try {
    const response = await axios.get(`${Baseurl}/posts/getSinglePost?post=${post_id}`);
    return response
  } catch (error) {
    return error
  }
}

const like = async (postId)=>{
  try {
    const response = await axios.put(`${Baseurl}/posts/likePost`, {postId}, {withCredentials: true});
    return response
  } catch (error) {
    return error
  }
}

const unLike = async (postId)=>{
  try {
    const response = await axios.put(`${Baseurl}/posts/unLikePost`, {postId}, {withCredentials: true})
    return response
  } catch (error) {
    return error
  }
}

const disLike = async (postId)=>{
  try {
    const response = await axios.put(`${Baseurl}/posts/disLikePost`, {postId}, {withCredentials: true});
    return response
  } catch (error) {
    return error
  }
}
const unDisLike = async (postId)=>{
  try {
    const response = await axios.put(`${Baseurl}/posts/unDisLikePost`, {postId}, {withCredentials:true});
    return response
  } catch (error) {
    return error
  }
}

export const APIS = {
  userWho,
  signup,
  signin,
  logout,
  getPosts,
  getSinglePost,
  like,
  disLike,
  unLike,
  unDisLike
};