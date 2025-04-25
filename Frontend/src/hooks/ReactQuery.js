import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIS } from "../../config/Config";

// CREATE POST
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await APIS.createPost(formData);
      const newPost = res.data;
      return newPost;
    },
    onSuccess: async (newPost) => {
      // Append the new post to the cached posts list
      queryClient.setQueryData(["userPosts", newPost.owner._id], (oldData) => {
        if (!oldData) return [newPost];
        return [newPost, ...oldData];
      });
      // await queryClient.cancelQueries(["userProfile",  newPost.owner._id]);
      // // queryClient.invalidateQueries(["userProfile",  newPost.owner._id]);
      // // Optionally update userProfile if you need to:
      // queryClient.setQueryData(["userProfile", newPost.owner._id], (oldProfile) => {
      //   console.log(oldProfile)
      //   if (!oldProfile) return oldProfile;
      //   return {
      //     ...oldProfile,
      //     posts: [newPost, ...(oldProfile.posts || [])],
      //   };
      // });
    },
  });
};


// UPDATE POST
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, formData }) => {
      return await APIS.updatePost(postId, formData);
    },
    onSuccess: (postId) => {
      // This will re-fetch all pages of your infinite query
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post._id === postId ? oldData : post
            ),
          })),
        };
      });
    },
  });
};

export const useupdateCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, formData }) => {
      // full updated comment returned here
      return await APIS.updateComment(commentId, formData);
    },
    onSuccess: (_, variables) => {
      const { postId, commentId } = variables;
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });

      queryClient.setQueryData(["comments", postId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((comment) =>
              comment._id === commentId ? old : comment
            ),
          })),
        };
      });
    },
  });
};





