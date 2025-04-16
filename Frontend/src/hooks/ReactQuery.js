import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIS } from "../../config/Config";

// CREATE POST
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => await APIS.createPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
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
    onSuccess: () => {
      // This will re-fetch all pages of your infinite query
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useupdateCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, formData }) => {
      return await APIS.updateComment(commentId, formData);
    },
    onSuccess: (_, variables) => {
      const { postId, commentId, newContent, updatedAt } = variables;

      queryClient.setQueryData(["comments", postId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((comment) =>
              comment._id === commentId
                ? {
                    ...comment,
                    comment: newContent,
                    updatedAt,
                  }
                : comment
            ),
          })),
        };
      });
    },
  });
};


