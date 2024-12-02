import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import apiService from "../services/apiService";
import { useAuth } from "./AuthContext";
import { useClientProfile } from "./ClientProfileContext";
import { useRef } from "react";

export interface Rating {
  id: number;
  user_id: number;
  rated_user_id: number;
  rating: number;
  content: string;
  user: {
    username: string;
  };
}

interface NewRating {
  user_id: number;
  rated_user_id: number;
  rating: number;
  content: string;
}

interface RatingContextType {
  ratings: Rating[];
  loading: boolean;
  error: string | null;
  fetchRatings: (profileId: number) => void;
  postRating: (rating: NewRating) => void;
  editRating: (ratingId: number, updatedRating: Rating) => void;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error("useRating must be used within a RatingProvider");
  }
  return context;
};

interface RatingProviderProps {
  children: ReactNode;
}

export const RatingProvider: React.FC<RatingProviderProps> = ({ children }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { profile } = useClientProfile();
  const { user } = useAuth();

  const loadingRef = useRef(false);

  useEffect(() => {
    console.log("useEffect triggered:", profile?.id, loadingRef.current);
    if (profile?.id && !loadingRef.current) {
      loadingRef.current = true;
      console.log("Fetching ratings for profileId:", profile.id);
      fetchRatings(profile.id);
    }
  }, [profile?.id]);

  const fetchRatings = async (profileId: number) => {
    console.log("Fetching ratings for profileId:", profileId);
    setError(null);

    try {
      const response = await apiService.get(`/ratings/${profileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log("API Response:", response.data);

      if (response.data.length === 0) {
        console.log("No ratings found");
        setRatings([]);
      } else {
        console.log("Ratings found:", response.data);
        setRatings(response.data);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      setError("Error fetching ratings.");
    } finally {
      console.log("Setting loading to false");
      loadingRef.current = false;
    }
  };

  const postRating = async (newRating: NewRating) => {
    try {
      const response = await apiService.post(`/ratings`, newRating, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setRatings((prevRatings) => [response.data, ...prevRatings]);
    } catch (error) {
      setError("Error posting rating.");
    }
  };

  const editRating = async (ratingId: number, updatedRating: Rating) => {
    try {
      const response = await apiService.put(
        `/ratings/${ratingId}`,
        updatedRating,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setRatings((prevRatings) =>
        prevRatings.map((rating) =>
          rating.id === ratingId ? response.data : rating
        )
      );
    } catch (error) {
      setError("Error editing rating.");
    }
  };

  return (
    <RatingContext.Provider
      value={{ ratings, loading, error, fetchRatings, postRating, editRating }}
    >
      {children}
    </RatingContext.Provider>
  );
};
