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
    mutationFn: async ({ postId, formData }) =>
      await APIS.updatePost(postId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });
};

