import React, { useState } from "react";
import {
  Rating,
  Typography,
  Button,
  Card,
  CardContent,
  Modal,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useClientProfile } from "../../../context/ClientProfileContext";
import { useAuth } from "../../../context/AuthContext";
import EditProfileBioSkill from "../../../views/editBioSkillForm";

function AboutMe() {
  const { profile, updateProfile } = useClientProfile();
  const { user } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const position: [number, number] | null = profile?.stores[0]?.location
    ? [
        parseFloat(profile.stores[0].location.latitude),
        parseFloat(profile.stores[0].location.longitude),
      ]
    : null;

  const [tempData, setTempData] = useState({
    aboutMe: profile?.about_me?.content || "",
    skills:
      profile?.role_name === "Graphic Designer"
        ? profile?.user_skills?.map((skill) => skill.skill_name).join(", ") ||
          ""
        : profile?.printing_skills
            ?.map((skill) => skill.printing_skill_name)
            .join(", ") || "",
  });

  const handleEditClick = () => setEditModalOpen(true);

  const handleSave = async (
    updatedAboutMe: string,
    updatedSkills: Skill[],
    updatedPrintingSkills: PrintingSkill[]
  ) => {
    await updateProfile(profile.id, {
      aboutMe: updatedAboutMe,
      skills:
        profile.role_name === "Graphic Designer"
          ? updatedSkills.map((skill) => skill.skill_name)
          : undefined,
      printingSkills:
        profile.role_name === "Printing Shop"
          ? updatedPrintingSkills.map((skill) => skill.printing_skill_name)
          : undefined,
    });

    setTempData({
      aboutMe: updatedAboutMe,
      skills:
        profile.role_name === "Graphic Designer"
          ? updatedSkills.map((skill) => skill.skill_name).join(", ")
          : updatedPrintingSkills
              .map((skill) => skill.printing_skill_name)
              .join(", "),
    });

    setEditModalOpen(false);
  };

  const isOwnProfile = user?.id === profile?.id;

  return (
    <Box
      flex={1}
      p={2}
      bgcolor="white"
      borderRadius={2}
      boxShadow={2}
      className="shadow-lg"
    >
      <Typography
        variant="h6"
        className="text-gray-800 font-bold mb-2"
        align="center"
      >
        {profile?.username || "User"}
      </Typography>

      <Box mb={2}>
        <Typography
          variant="body1"
          className="text-gray-600"
          display="inline"
          mr={1}
        >
          Skills:
        </Typography>
        <Typography variant="body2" className="text-gray-600" display="inline">
          {tempData.skills}
        </Typography>
      </Box>

      {/* <Box mb={2}>
        <Typography
          variant="body1"
          className="text-gray-600"
          display="inline"
          mr={1}
        >
          Rating:
        </Typography>
        <Rating
          name="read-only"
          value={profile?.verified ? 4.8 : 4.0}
          readOnly
          precision={0.1}
        />
      </Box> */}

      <Box mb={2}>
        <Typography
          variant="body1"
          className="text-gray-600"
          display="inline"
          mr={1}
        >
          Location:
        </Typography>
        <Typography
          variant="body2"
          className="text-blue-600 underline cursor-pointer"
          onClick={() => setMapModalOpen(true)}
        >
          {profile?.stores[0]?.storename || "Store Name Not Set"} -{" "}
          {profile?.stores[0]?.location?.address || "Address Not Set"}
        </Typography>
      </Box>

      <Card className="w-full mt-2">
        <CardContent>
          <Typography variant="body1" className="text-gray-600 mb-2">
            About Me:
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            {tempData.aboutMe}
          </Typography>
        </CardContent>
      </Card>

      {isOwnProfile && (
        <Box mt={4} textAlign="center">
          <Button
            variant="outlined"
            color="primary"
            onClick={handleEditClick}
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
        </Box>
      )}

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          className="bg-white p-4 rounded-lg shadow-lg"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "600px",
          }}
        >
          <Typography variant="h6" className="mb-4">
            Edit Profile Information
          </Typography>
          <EditProfileBioSkill
            onSave={(updatedAboutMe, updatedSkills, updatedPrintingSkills) =>
              handleSave(updatedAboutMe, updatedSkills, updatedPrintingSkills)
            }
            onClose={() => setEditModalOpen(false)}
          />
          <Button
            onClick={() => setEditModalOpen(false)}
            variant="outlined"
            color="secondary"
            className="mt-4"
          >
            Close
          </Button>
        </Box>
      </Modal>

      <Modal open={mapModalOpen} onClose={() => setMapModalOpen(false)}>
        <Box
          className="bg-white p-4 rounded-lg shadow-lg"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "600px",
          }}
        >
          <Typography variant="h6" className="mb-4">
            Store Location
          </Typography>
          {position && (
            <MapContainer
              center={position}
              zoom={13}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={position} />
            </MapContainer>
          )}
          <Button
            onClick={() => setMapModalOpen(false)}
            variant="outlined"
            color="secondary"
            className="mt-4"
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}

export default AboutMe;
