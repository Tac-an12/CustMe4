import React, { createContext, useContext, useState, ReactNode } from "react";
import apiService from "../services/apiService";

interface Role {
  roleid: number;
  rolename: string;
  created_at: string;
  updated_at: string;
}

interface PersonalInformation {
  id: number;
  firstname: string;
  lastname: string;
  profilepicture: string | null;
  coverphoto: string | null;
  zipcode: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

interface Image {
  image_id: number;
  image_path: string;
  created_at: string;
  updated_at: string;
  post_id: number;
}

interface Post {
  post_id: number;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  user_id: number;
  images: Image[];
}

interface Store {
  id: number;
  storename: string;
  description: string;
  location_id: number;
  user_id: number;
  location: {
    id: number;
    longitude: string;
    latitude: string;
    address: string;
    created_at: string;
    updated_at: string;
  };
}

interface AboutMe {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

interface PrintingSkill {
  printing_skill_id: number;
  printing_skill_name: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  verified: number;
  role_name: string;
  personal_information: PersonalInformation;
  stores: Store[];
  posts: Post[];
  about_me: AboutMe;
  printing_skills: PrintingSkill[];
  user_skills: any[]; // Adjust type if necessary
}

interface ClientProfileContextProps {
  profile: UserProfile | null;
  fetchProfile: (userId: number) => Promise<void>;
  updateProfile: (
    userId: number,
    data: Partial<PersonalInformation>,
    files?: { profilepicture?: File; coverphoto?: File }
  ) => Promise<void>;
  updateBioAndSkills: (
    userId: number,
    bio: string,
    skills: number[],
    printingSkills: number[]
  ) => Promise<void>;
  loading: boolean;
}

const ClientProfileContext = createContext<
  ClientProfileContextProps | undefined
>(undefined);

interface ClientProfileProviderProps {
  children: ReactNode;
}

export const ClientProfileProvider: React.FC<ClientProfileProviderProps> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProfile = async (userId: number) => {
    if (loading || (profile && profile.id === userId)) {
      console.log(
        "Profile already loaded or loading in progress, skipping fetch."
      );
      return;
    }

    setLoading(true);
    console.log(`Fetching profile for user ID: ${userId}`);

    try {
      const response = await apiService.get(`/users/${userId}/profile`);
      console.log("Profile fetched:", response.data);

      const userProfile: UserProfile = {
        id: response.data.user.id,
        username: response.data.user.username,
        email: response.data.user.email,
        verified: response.data.user.verified,
        role_name: response.data.user.role_name,
        personal_information: response.data.user.personal_information,
        stores: response.data.user.stores || [],
        posts: response.data.user.posts || [],
        about_me: response.data.user.about_me,
        printing_skills: response.data.user.printing_skills,
        user_skills: response.data.user.user_skills || [],
      };

      setProfile(userProfile);
    } catch (error) {
      console.error("Error fetching client profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    userId: number,
    data: Partial<PersonalInformation>,
    files?: { profilepicture?: File; coverphoto?: File }
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("firstname", data.firstname || "");
    formData.append("lastname", data.lastname || "");
    formData.append("zipcode", data.zipcode || "");

    if (files?.profilepicture) {
      formData.append("profilepicture", files.profilepicture);
    }
    if (files?.coverphoto) {
      formData.append("coverphoto", files.coverphoto);
    }

    formData.append("_method", "PUT");

    try {
      const response = await apiService.post(
        `/users/${userId}/updateprofile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.status === 200) {
        console.log("Profile successfully updated on server.");
        await fetchProfile(userId); // Refetch profile to update with latest data
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const updateBioAndSkills = async (
    userId: number,
    bio: string,
    skills: number[],
    printingSkills: number[]
  ): Promise<void> => {
    try {
      const response = await apiService.put(
        `/users/${userId}/update-bio&skills`,
        {
          bio,
          skills,
          printing_skills: printingSkills,
        }
      );

      if (response.status === 200) {
        console.log("Bio and skills updated successfully.");
        await fetchProfile(userId); // Refresh profile with latest data
      }
    } catch (error) {
      console.error("Error updating bio and skills:", error);
    }
  };

  return (
    <ClientProfileContext.Provider
      value={{
        profile,
        fetchProfile,
        updateProfile,
        updateBioAndSkills,
        loading,
      }}
    >
      {children}
    </ClientProfileContext.Provider>
  );
};

export const useClientProfile = (): ClientProfileContextProps => {
  const context = useContext(ClientProfileContext);
  if (!context) {
    throw new Error(
      "useClientProfile must be used within a ClientProfileProvider"
    );
  }
  return context;
};
