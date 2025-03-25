import axios from "axios";

const Baseurl = "http://localhost:3000/api";

const userWho = async () => {
  try {
    const response = await axios.get(`${Baseurl}/user/userWho`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    return error;
  }
};

const signup = async (data) => {
  try {
    const response = await axios.post(`${Baseurl}/user/signup`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response;
  } catch (error) {
    return error;
  }
};
const signin = async (data) => {
  try {
    const response = await axios.post(
      `${Baseurl}/user/signin`,
      { data },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const logout = async () => {
  try {
    const response = await axios.post(
      `${Baseurl}/user/logout`,
      {},
      { withCredentials }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const getUser = async (id) => {
  try {
    const response = await axios.get(`${Baseurl}/user/getUser?user=${id}`);
    return response;
  } catch (error) {
    return error;
  }
};
// Post related APIs
const createPost = async (data) => {
  try {
    const response = await axios.post(`${Baseurl}/posts/createPost`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response;
  } catch (error) {
    return error;
  }
};

const delPost = async(postId)=>{
  try {
    const response = await axios.post(`${Baseurl}/posts/delPost?postId=${postId}`, {}, {withCredentials: true});
    return response
  } catch (error) {
    return error
  }
}

const getPosts = async () => {
  try {
    const response = await axios.get(`${Baseurl}/posts/getPosts`);
    return response;
  } catch (error) {
    return error;
  }
};

const getSinglePost = async (post_id) => {
  try {
    const response = await axios.get(
      `${Baseurl}/posts/getSinglePost?post=${post_id}`
    );
    return response;
  } catch (error) {
    return error;
  }
};

const like = async (postId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/likePost`,
      { postId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const unLike = async (postId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/unLikePost`,
      { postId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const disLike = async (postId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/disLikePost`,
      { postId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const unDisLike = async (postId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/unDisLikePost`,
      { postId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};


const likeMedia = async (postId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/likeMedia`,
      { postId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const unLikeMedia = async (postId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/unLikeMedia`,
      { postId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const disLikeMedia = async (postId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/disLikeMedia`,
      { postId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const unDisLikeMedia = async (postId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/unDisLikeMedia`,
      { postId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};

const addComment = async (data) => {
  try {
    const response = await axios.post(
      `${Baseurl}/posts/addComment`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const getcomments = async (postId) => {
  try {
    const response = await axios.get(
      `${Baseurl}/posts/getComments?post=${postId}`,
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};

const likeComment = async (comntId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/likeComment`,
      { comntId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const unLikeComment = async (comntId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/unLikeComment`,
      { comntId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const disLikeComment = async (comntId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/disLikeComment`,
      { comntId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};
const unDisLikeComment = async (comntId) => {
  try {
    const response = await axios.put(
      `${Baseurl}/posts/unDisLikeComment`,
      { comntId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};

const addReply = async (data) => {
  // console.log(data)
  try {
    const response = await axios.post(`${Baseurl}/posts/addReply`, data, {withCredentials: true });
    return response
  } catch (error) {
    return error;
  }
}

const getReplies = async (comntId)=>{
  try {
    const response = await axios.get(`${Baseurl}/posts/getReplies?comment=${comntId}`);
    return response
  } catch (error) {
    return error
  }
}


export const APIS = {
  userWho,
  signup,
  signin,
  getUser,
  logout,
  createPost,
  getPosts,
  delPost,
  getSinglePost,
  like,
  disLike,
  unLike,
  unDisLike,
  likeMedia,
  unLikeMedia,
  disLikeMedia,
  unDisLikeMedia,
  addComment,
  getcomments,
  likeComment,
  unLikeComment,
  disLikeComment,
  unDisLikeComment,
  addReply,
  getReplies

};
