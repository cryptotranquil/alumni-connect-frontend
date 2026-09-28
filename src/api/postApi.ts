import type { Post, CreatePostInput } from "../types";
import { api, getErrorMessage } from "./client";

type PostResponse = Post | { success?: boolean; post?: Post; data?: Post };

function unwrapPost(data: PostResponse): Post {
  if (!Array.isArray(data) && "post" in data && data.post) return data.post;
  if (!Array.isArray(data) && "data" in data && data.data) return data.data;
  return data as Post;
}

function unwrapPosts(data: Post[] | { posts?: Post[]; data?: Post[] }): Post[] {
  if (Array.isArray(data)) return data;
  return data.posts ?? data.data ?? [];
}

export async function getFeedApi(): Promise<Post[]> {
  try {
    const { data } = await api.get<Post[] | { posts?: Post[]; data?: Post[] }>("/posts");
    return unwrapPosts(data);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load the community feed"));
  }
}

export async function createPostApi(input: CreatePostInput): Promise<Post> {
  try {
    const { data } = await api.post<PostResponse>("/posts", input);
    return unwrapPost(data);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Could not publish post"));
  }
}

export async function toggleLikePostApi(id: string): Promise<Post> {
  try {
    const { data } = await api.post<PostResponse>(`/posts/${id}/like`);
    return unwrapPost(data);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Could not update like"));
  }
}

export async function addCommentApi(id: string, text: string): Promise<Post> {
  try {
    const { data } = await api.post<PostResponse>(`/posts/${id}/comments`, { text });
    return unwrapPost(data);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Could not add comment"));
  }
}

export async function editPostApi(id: string, text: string): Promise<Post> {
  try {
    const { data } = await api.put<PostResponse>(`/posts/${id}`, { text });
    return unwrapPost(data);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Could not save post"));
  }
}

export async function deletePostApi(id: string): Promise<void> {
  try {
    await api.delete(`/posts/${id}`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Could not delete post"));
  }
}
