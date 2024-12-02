import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPaperPlane, FaComments } from "react-icons/fa";
import Header from "../components/header";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";
import { useRequest } from "../../../context/RequestContext";
import RequestModal from "../../requestmore"; // Adjust the path as necessary
import { useDesignerProviderContext } from "../../../context/Desing&ProviderContext";
import { usePostContext } from "../../../context/PostContext"; // Import PostContext
import { useAuth } from "../../../context/AuthContext";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};

interface Image {
  image_id: number;
  image_path: string;
}

const DesignerPostForm: React.FC = () => {
  const { fetchDesignerPosts } = useDesignerProviderContext();
  const { handleRequest } = useRequest();
  const { user: authUser } = useAuth();
  const { user, deletePost } = usePostContext(); // Access user from context
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [requestContent, setRequestContent] = useState("");
  const [designerPosts, setDesignerPosts] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedDesignerPosts = await fetchDesignerPosts(1, 4);
        setDesignerPosts(fetchedDesignerPosts.slice(0, 4) ?? []);
      } catch (error) {
        console.error("Error fetching designer posts:", error);
        setDesignerPosts([]);
      }
    };
    fetchPosts();
  }, [fetchDesignerPosts]);

  const handleEdit = (
    postId: number,
    title: string,
    content: string,
    images: Image[]
  ) => {
    navigate(`/posts/${postId}`, { state: { postId, title, content, images } });
  };

  const handleDelete = (postId: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost(postId);
    }
  };

  const handleSendMessage = (userId: number) => {
    navigate("/chats", { state: { userId } });
  };

  const handleRequestButtonClick = (postId: number, postUserId: number) => {
    setSelectedPost(postId);
    setTargetUserId(postUserId);
    setModalOpen(true);
  };

  const handleRequestSubmit = async () => {
    if (selectedPost) {
      const selectedPostData = designerPosts.find(
        (post) => post.post_id === selectedPost
      );
      if (selectedPostData) {
        const userId = selectedPostData.user_id;
        setTargetUserId(userId);
        await handleRequest(selectedPost, userId, requestContent);
        setModalOpen(false); // Close the modal after submitting
        setRequestContent(""); // Reset fields
      } else {
        console.error("Selected post not found");
      }
    }
  };

  const renderPosts = (posts: any[], title: string) => (
    <div className="mb-8">
      <Typography variant="h5" className="mb-4 font-bold">
        {title}
      </Typography>
      <div className="flex justify-center gap-4 flex-wrap ">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card
              key={post.post_id}
              className="shadow-lg"
              style={{ width: "300px", height: "auto" }}
            >
              {post.images.length > 0 ? (
                <ImageCarousel images={post.images} />
              ) : (
                <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                  <p className="text-gray-600">No Image Available</p>
                </div>
              )}
              <CardContent>
                <div className="flex items-center mb-2">
                  <img
                    src={"https://via.placeholder.com/40"}
                    alt="Profile"
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <div>
                    <Typography
                      variant="subtitle1"
                      className="font-bold cursor-pointer"
                      onClick={() =>
                        navigate(`/clients/${post.user_id}/profile`)
                      }
                    >
                      {post.user?.username || "Unknown"}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {post.user?.role?.rolename || "N/A"}
                    </Typography>
                  </div>
                </div>
                <Typography variant="h6" component="h2" className="font-bold">
                  Title: {post.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="mb-2"
                >
                  Content: {post.content}
                </Typography>
                <div className="mb-3">
                  <Typography
                    variant="body2"
                    color="textPrimary"
                    className="mb-1"
                  >
                    <strong>Price:</strong>{" "}
                    {post.price ? `${post.price}` : "N/A"}
                  </Typography>
                  {/* <Typography variant="body2" color="textPrimary" className="mb-1">
                    <strong>Quantity:</strong> {post.quantity ? `${post.quantity}` : 'N/A'}
                  </Typography> */}
                  {/* <Typography variant="body2" color="textSecondary" className="mb-1">
                    <strong>Created:</strong> {post.created_at ? formatDate(post.created_at) : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Updated:</strong> {post.updated_at ? formatDate(post.updated_at) : 'N/A'}
                  </Typography> */}
                </div>
              </CardContent>
              <CardActions className="flex flex-row justify-between items-center">
                <div className="flex flex-row space-x-2">
                  {post.user_id !== user.id && (
                    <Button
                      onClick={() =>
                        handleRequestButtonClick(post.post_id, post.user_id)
                      }
                      variant="outlined"
                      startIcon={<FaPaperPlane />}
                      size="small"
                      color="primary"
                    >
                      Apply
                    </Button>
                  )}
                  {post.user_id === user.id && (
                    <>
                      <Button
                        onClick={() =>
                          handleEdit(
                            post.post_id,
                            post.title,
                            post.content,
                            post.images
                          )
                        }
                        variant="outlined"
                        startIcon={<FaEdit />}
                        size="small"
                        color="success"
                        className="mt-2"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(post.post_id)}
                        variant="outlined"
                        startIcon={<FaTrash />}
                        size="small"
                        color="error"
                        className="mt-2"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleSendMessage(post.user_id)}
                    variant="outlined"
                    startIcon={<FaComments />}
                    color="primary"
                    size="small"
                  >
                    Chat
                  </Button>
                </div>
              </CardActions>
            </Card>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No posts available.
          </Typography>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="mt-16">
          {renderPosts(designerPosts, "Graphic Designer Posts")}
        </div>

        {/* Request Modal */}
        <RequestModal
          open={modalOpen}
          handleClose={() => setModalOpen(false)}
          setRequestContent={setRequestContent}
          selectedPost={selectedPost}
          targetUserId={targetUserId ?? 0}
          role={authUser?.role?.rolename || "N/A"}
        />
      </div>
    </div>
  );
};

const ImageCarousel: React.FC<{ images: Image[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full h-48">
      <button
        onClick={prevImage}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-transparent text-white px-2 py-1 rounded-full focus:outline-none hover:bg-gray-700 hover:bg-opacity-70 transition"
      >
        &#8249;
      </button>
      <img
        src={`http://127.0.0.1:8000/storage/${images[currentIndex].image_path}`}
        alt={`Post Image ${images[currentIndex].image_id}`}
        className="w-full h-full object-cover"
      />
      <button
        onClick={nextImage}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-transparent text-white px-2 py-1 rounded-full focus:outline-none hover:bg-gray-800"
      >
        &#8250;
      </button>
    </div>
  );
};

export default DesignerPostForm;
