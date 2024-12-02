import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { usePostContext } from "../../../context/PostContext";
import { useAuth } from "../../../context/AuthContext";
import Header from "../components/header";
import { format } from "date-fns";

interface Image {
  image_id: number;
  image_path: string;
}

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

const GraphicDesignerHomeForm: React.FC = () => {
  const { posts, fetchMyPosts, deletePost } = usePostContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [designerPosts, setDesignerPosts] = useState<any[]>([]);

  useEffect(() => {
    if (posts.length === 0) {
      fetchMyPosts(); // Fetch all user's posts if posts are empty
    } else {
      // Filter posts only once based on the current posts
      setDesignerPosts(posts.filter((post) => post.user_id === user?.id));
    }
  }, [fetchMyPosts, posts, user]);

  const handleEdit = (
    postId: number,
    title: string,
    content: string,
    images,
    price: number | null,
    quantity: number | null
  ) => {
    navigate(`/posts/${postId}`, {
      state: { postId, title, content, images, price, quantity },
    });
  };

  const handleDelete = (postId: number) => {
    if (user) {
      deletePost(postId);
    }
  };

  const PostCard = ({ post }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handlePrevImage = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : post.images.length - 1
      );
    };

    const handleNextImage = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex < post.images.length - 1 ? prevIndex + 1 : 0
      );
    };

    return (
      <Card
        key={post.post_id}
        className="shadow-lg"
        style={{
          width: "100%",
          maxWidth: "400px", // Adjusted to make it more vertically oriented
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column", // Ensuring the card content is vertically stacked
        }}
      >
        {post.images && post.images.length > 0 ? (
          <div className="relative h-48">
            <img
              src={`http://127.0.0.1:8000/storage/${post.images[currentIndex].image_path}`}
              alt={`Post Image ${post.images[currentIndex].image_id}`}
              className="w-full h-full object-cover rounded-t-md"
            />
            {post.images.length > 1 && (
              <div className="absolute top-1/2 left-0 right-0 flex justify-between px-2 transform -translate-y-1/2">
                <IconButton onClick={handlePrevImage}>
                  <ArrowBackIcon />
                </IconButton>
                <IconButton onClick={handleNextImage}>
                  <ArrowForwardIcon />
                </IconButton>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
            <p className="text-gray-600">No Image Available</p>
          </div>
        )}

        <CardContent className="flex flex-col justify-between">
          <div className="flex items-center mb-4">
            <div className="ml-3">
              {/* <Avatar
              alt={post.user.username}
              src={post.user.avatar || "/static/images/avatar/1.jpg"}
              sx={{ width: 40, height: 40 }}
            /> */}
              <div className="ml-3">
                <Typography variant="subtitle1" className="font-bold">
                  {post.user.username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {post.user.role?.rolename || "N/A"}
                </Typography>
              </div>
              <IconButton onClick={handleMenuOpen} className="ml-auto">
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() =>
                    handleEdit(
                      post.post_id,
                      post.title,
                      post.content,
                      post.images,
                      post.price,
                      post.quantity
                    )
                  }
                >
                  Edit
                </MenuItem>
                <MenuItem onClick={() => handleDelete(post.post_id)}>
                  Delete
                </MenuItem>
              </Menu>
            </div>
          </div>

          <Typography variant="h6" component="h2" className="font-bold mb-2">
            <strong>Title:</strong> {post.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" className="mb-3">
            <strong>Content:</strong> {post.content}
          </Typography>

          <Typography variant="body2" color="textPrimary" className="mb-1">
            <strong>Price:</strong> {post.price ? `₱${post.price}` : "N/A"}
          </Typography>
          {/* <Typography variant="body2" color="textSecondary" className="mb-1">
            <strong>Created:</strong>{" "}
            {post.created_at ? formatDate(post.created_at) : "N/A"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Updated:</strong>{" "}
            {post.updated_at ? formatDate(post.updated_at) : "N/A"}
          </Typography> */}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="mt-16 p-8">
          <Typography variant="h5" className="mb-6 font-bold">
            My Graphic Designer Posts
          </Typography>
          <div className="space-y-8">
            {designerPosts.length > 0 ? (
              designerPosts.map((post) => (
                <PostCard key={post.post_id} post={post} />
              ))
            ) : (
              <Typography>No posts available</Typography>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicDesignerHomeForm;
