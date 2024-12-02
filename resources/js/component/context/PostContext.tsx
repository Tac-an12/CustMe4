import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import apiService from "../services/apiService";
import { useAuth, User } from "../../../js/component/context/AuthContext";

interface Image {
  image_id: number;
  image_path: string;
}

interface Post {
  post_id: number;
  title: string;
  content: string;
  user_id: number;
  price: number;
  quantity;
  number;
  images: Image[];
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    role: {
      rolename: string;
    };
  };
}

interface PostContextType {
  posts: Post[];
  fetchPosts: (page: number, limit: number) => void;
  fetchMyPosts: () => void; // Removed page and limit
  fetchClientPosts: (page: number, limit: number) => void; // New method
  fetchDesignerPosts: (page: number, limit: number) => void; // New method
  fetchProviderPosts: (page: number, limit: number) => void; // New method
  addPost: (newPost: Post) => void;
  updatePost: (updatedPost: Post) => void;
  deletePost: (postId: number) => void;
  getUserImages: () => Promise<Image[]>;
  user: User | null;
  currentPage: number;
  totalPosts: number;
  totalPages: number;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const { user } = useAuth();
  const postsPerPage = 4;

  const fetchPosts = useCallback(async (page: number, limit: number) => {
    try {
      const response = await apiService.get<{
        data: Post[];
        total: number;
        last_page: number;
      }>(`/allposts?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const fetchedPosts = response.data.data.map((post) => ({
        ...post,
        images: post.images || [],
        user: post.user || { username: "Unknown", role: { rolename: "N/A" } },
      }));
      setPosts(fetchedPosts);
      setTotalPosts(response.data.total);
      setTotalPages(response.data.last_page);
      setCurrentPage(page);
    } catch (error) {
      console.log("Error fetching posts:", error);
    }
  }, []);

  // New method to fetch user's posts
  const fetchMyPosts = useCallback(async () => {
    try {
      const response = await apiService.get<{ posts: Post[] }>("/myposts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      // Check the response structure
      console.log("Response from myPosts:", response.data);

      const fetchedPosts = response.data.posts.map((post) => ({
        ...post,
        images: post.images || [],
        user: post.user || { username: "Unknown", role: { rolename: "N/A" } },
      }));
      setPosts(fetchedPosts);
      setTotalPosts(fetchedPosts.length); // Update total posts
      setTotalPages(1); // Since no pagination, we only need 1 page
      setCurrentPage(1); // Set current page to 1 since there's no pagination
    } catch (error) {
      console.log("Error fetching my posts:", error);
    }
  }, []);

  const fetchDesignerPosts = useCallback(
    async (page: number, limit: number) => {
      try {
        const response = await apiService.get<{ posts: Post[] }>(
          `/designerposts?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        console.log("Designer Posts Response:", response.data); // Log the response for debugging

        const fetchedPosts = response.data.posts.map((post) => ({
          ...post,
          images: post.images || [],
          user: post.user || { username: "Unknown", role: { rolename: "N/A" } },
        }));
        setPosts(fetchedPosts);
        setTotalPosts(fetchedPosts.length); // Update total posts
        setTotalPages(Math.ceil(fetchedPosts.length / postsPerPage)); // Calculate total pages based on fetched posts
        setCurrentPage(page);
      } catch (error) {
        console.log("Error fetching designer posts:", error);
      }
    },
    []
  );

  const fetchProviderPosts = useCallback(
    async (page: number, limit: number) => {
      try {
        const response = await apiService.get<{ posts: Post[] }>(
          `/providerposts?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        console.log("Provider Posts Response:", response.data); // Log the response for debugging

        const fetchedPosts = response.data.posts.map((post) => ({
          ...post,
          images: post.images || [],
          user: post.user || { username: "Unknown", role: { rolename: "N/A" } },
        }));
        setPosts(fetchedPosts);
        setTotalPosts(fetchedPosts.length); // Update total posts
        setTotalPages(Math.ceil(fetchedPosts.length / postsPerPage)); // Calculate total pages based on fetched posts
        setCurrentPage(page);
      } catch (error) {
        console.log("Error fetching provider posts:", error);
      }
    },
    []
  );

  const fetchClientPosts = useCallback(async (page: number, limit: number) => {
    try {
      const response = await apiService.get<{ posts: Post[] }>(
        `/clientposts?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("Client Posts Response:", response.data);

      const fetchedPosts = response.data.posts.map((post) => ({
        ...post,
        images: post.images || [],
        user: post.user || { username: "Unknown", role: { rolename: "N/A" } },
      }));
      setPosts(fetchedPosts);
      setTotalPosts(fetchedPosts.length);
      setTotalPages(Math.ceil(fetchedPosts.length / postsPerPage));
      setCurrentPage(page);
    } catch (error) {
      console.log("Error fetching client posts:", error);
    }
  }, []);

  const addPost = useCallback((newPost: Post) => {
    setPosts((prevPosts) => [
      { ...newPost, images: newPost.images || [] },
      ...prevPosts,
    ]);
  }, []);

  const updatePost = useCallback(async (updatedPost: Post) => {
    try {
      const response = await apiService.put(
        `/posts/${updatedPost.post_id}`,
        updatedPost,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.status === 200) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === updatedPost.post_id ? updatedPost : post
          )
        );
      }
    } catch (error) {
      console.log("Error updating post:", error);
    }
  }, []);

  const deletePost = useCallback(async (postId: number) => {
    try {
      await apiService.delete(`/delete-posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.post_id !== postId)
      );
    } catch (error) {
      console.log("Error deleting post:", error);
    }
  }, []);

  // New function to get user images
  const getUserImages = useCallback(async () => {
    try {
      if (user) {
        const response = await apiService.get(`/users/${user.id}/images`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        return response.data.images || [];
      }
    } catch (error) {
      console.log("Error fetching user images:", error);
      return [];
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPosts(currentPage, postsPerPage);
    }
  }, [user, currentPage, fetchPosts]);

  return (
    <PostContext.Provider
      value={{
        posts,
        fetchPosts,
        fetchClientPosts,
        fetchMyPosts,
        fetchDesignerPosts,
        fetchProviderPosts,
        addPost,
        updatePost,
        deletePost,
        getUserImages,
        user,
        currentPage,
        totalPosts,
        totalPages,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};
