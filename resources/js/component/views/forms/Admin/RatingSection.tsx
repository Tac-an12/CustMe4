import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  TextField,
  Rating as MuiRating,
  Card,
  CardContent,
  Box,
  CircularProgress,
} from "@mui/material";
import { useRating } from "../../../context/RatingContext";
import { useClientProfile } from "../../../context/ClientProfileContext";
import { useAuth } from "../../../context/AuthContext";
import { Rating } from "../../../context/RatingContext";
import CustomAlert from "../../../alert/CustomeAlert"; // Adjust the import path if needed

const RatingSection: React.FC = () => {
  const { ratings, loading, error, fetchRatings, postRating, editRating } =
    useRating();
  const [ratingValue, setRatingValue] = useState<number | null>(null);
  const [ratingText, setRatingText] = useState("");
  const [ratingToEdit, setRatingToEdit] = useState<Rating | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
    onConfirm: () => {},
    onCancel: undefined as (() => void) | undefined,
  });

  const { profile } = useClientProfile();
  const { user } = useAuth();

  const userId = profile?.id;
  const loggedInUserId = user?.id;
  const loggedInUserRole = user?.role?.rolename;

  useEffect(() => {
    if (userId && !loading && ratings.length === 0) {
      // Fetch ratings only if the ratings array is empty and loading is false
      console.log("Fetching ratings for ratedUserId:", userId); // Debugging log
      fetchRatings(userId);
    }
  }, [userId, ratings.length, loading, fetchRatings]);

  // Submit a new rating
  const handleRatingSubmit = () => {
    if (ratingValue && ratingText.trim()) {
      const ratingData = {
        user_id: loggedInUserId ?? 0,
        rated_user_id: userId ?? 0,
        rating: ratingValue,
        content: ratingText,
      };

      postRating(ratingData);
      setRatingValue(null);
      setRatingText("");
      showAlert("Success", "Your rating has been submitted.", "success");
    } else {
      showAlert(
        "Error",
        "Please provide a rating and comment before submitting.",
        "error"
      );
    }
  };

  // Submit an edited rating
  const handleRatingEditSubmit = () => {
    if (
      ratingToEdit &&
      ratingValue !== null &&
      ratingValue !== undefined &&
      ratingText.trim()
    ) {
      const updatedRating: Rating = {
        ...ratingToEdit,
        rating: ratingValue,
        content: ratingText,
      };

      editRating(ratingToEdit.id, updatedRating);
      fetchRatings(userId ?? 0);
      setRatingToEdit(null);
      setRatingValue(null);
      setRatingText("");
      showAlert("Success", "Your rating has been updated.", "success");
    } else {
      showAlert(
        "Error",
        "Please provide a valid rating and comment to edit.",
        "error"
      );
    }
  };

  // Show alert dialog dynamically
  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning",
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertOpen(false)),
      onCancel: onCancel || (() => setAlertOpen(false)),
    });
    setAlertOpen(true);
  };

  // Handle editing an existing rating
  const handleEditRating = (rating: Rating) => {
    setAlertOpen(true);
    setAlertConfig({
      title: "Edit Rating",
      message: "Are you sure you want to edit this rating?",
      type: "warning",
      onConfirm: () => {
        setRatingToEdit(rating);
        setRatingValue(rating.rating);
        setRatingText(rating.content);
        setAlertOpen(false); // Close the alert when confirming
      },
      onCancel: () => {
        setAlertOpen(false); // Close the alert when canceling
      },
    });
  };

  // Check if the logged-in user has already rated the profile
  const userRating = ratings.find(
    (rating) => rating.user_id === loggedInUserId
  );

  // Determine if the logged-in user can submit a rating
  const canSubmitRating =
    loggedInUserRole === "User" && userId !== loggedInUserId && !userRating;

  // Sort ratings
  const sortedRatings = ratings.sort((a, b) => {
    if (a.user_id === loggedInUserId) return -1;
    if (b.user_id === loggedInUserId) return 1;
    return 0;
  });

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      {canSubmitRating && (
        <div>
          <Typography variant="h6" className="font-semibold">
            Rate this profile
          </Typography>
          <MuiRating
            value={ratingValue || 0}
            onChange={(event, newValue) => setRatingValue(newValue ?? 0)}
          />
          <TextField
            label="Add a Comment"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={ratingText}
            onChange={(event) => setRatingText(event.target.value)}
            className="my-4"
          />
          <Button onClick={handleRatingSubmit} color="primary">
            Submit Rating
          </Button>
        </div>
      )}

      {/* Render Edit Form when ratingToEdit is set */}
      {ratingToEdit && (
        <div>
          <Typography variant="h6" className="font-semibold">
            Edit Your Rating
          </Typography>
          <MuiRating
            value={ratingValue || 0}
            onChange={(event, newValue) => setRatingValue(newValue ?? 0)}
          />
          <TextField
            label="Edit Comment"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={ratingText}
            onChange={(event) => setRatingText(event.target.value)}
            className="my-4"
          />
          <Button onClick={handleRatingEditSubmit} color="primary">
            Submit Edited Rating
          </Button>
          <Button
            onClick={() => {
              setRatingToEdit(null); // Cancel editing
              setRatingValue(null);
              setRatingText("");
            }}
            color="secondary"
          >
            Cancel Editing
          </Button>
        </div>
      )}

      {/* Ratings Display */}
      <Box>
        <Typography variant="h6" className="font-semibold mb-2">
          User Ratings
        </Typography>
        {sortedRatings.length === 0 ? (
          <Typography>No ratings yet.</Typography>
        ) : (
          sortedRatings.map((rating) => (
            <Card
              key={rating.id}
              className="shadow-md mb-4"
              sx={{ border: "1px solid #ccc" }}
            >
              <CardContent>
                <Typography variant="body1">
                  <MuiRating value={rating.rating} readOnly size="small" />
                  <Typography variant="caption" color="textSecondary" ml={1}>
                    {rating.user?.username || "No username"}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {rating.content}
                </Typography>
              </CardContent>
              {rating.user_id === loggedInUserId && !ratingToEdit && (
                <Button onClick={() => handleEditRating(rating)}>Edit</Button>
              )}
            </Card>
          ))
        )}
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      {/* Custom Alert Dialog */}
      <CustomAlert
        open={alertOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </div>
  );
};

export default RatingSection;
