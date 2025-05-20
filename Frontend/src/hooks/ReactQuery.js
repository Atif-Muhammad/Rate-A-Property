import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIS } from "../../config/Config";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      try {
        const res = await APIS.createPost(formData);
        if (res.status === 400) {
          throw new Error(
            "Your post appears to violate our community guidelines (e.g., adult or harmful content). Please review and edit your content."
          );
        }
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async (newPost) => {
      queryClient.setQueryData(["userPosts", newPost.owner._id], (oldData) => {
        if (!oldData) return [newPost];
        return [newPost, ...oldData];
      });
    },
  });
};

// useUpdatePost.js
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, formData }) => {
      try {
        const res = await APIS.updatePost(postId, formData);
        if (res.status === 400) {
          throw new Error(
            "Your post appears to violate our community guidelines (e.g., adult or harmful content). Please review and edit your content."
          );
        }
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post._id === updatedPost._id ? updatedPost : post
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
      const response = await APIS.updateComment(commentId, formData);

      if (response.status === 400) {
        const error = new Error(
          response.data?.message ||
            "Your comment violates our community guidelines. Please review the rules and try again."
        );
        error.status = 400;
        throw error;
      }

      return response;
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
