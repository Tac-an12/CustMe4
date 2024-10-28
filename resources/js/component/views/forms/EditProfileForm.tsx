import React, { useState, useEffect } from 'react';
import { Modal, Button, TextField, Typography } from '@mui/material';
import { useClientProfile } from '../../context/ClientProfileContext';

interface EditProfileModalProps {
    open: boolean;
    onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose }) => {
    const { profile, updateProfile } = useClientProfile();

    // State variables for form fields
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [profilepicture, setProfilePicture] = useState<File | undefined>(undefined);
    const [coverphoto, setCoverPhoto] = useState<File | undefined>(undefined);

    // Populate form fields when the profile data or modal state changes
    useEffect(() => {
        if (profile?.personal_information && open) {
            setFirstname(profile.personal_information.firstname || '');
            setLastname(profile.personal_information.lastname || '');
            setProfilePicture(undefined); // Reset selected files on modal open
            setCoverPhoto(undefined);
        }
    }, [profile, open]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (profile?.id) {
            await updateProfile(profile.id, { firstname, lastname }, { profilepicture, coverphoto });
            onClose(); // Close the modal after updating
            
            // Reload the page to show the updated profile data
            window.location.reload();
        }
    };

    // Current images URLs
    const currentProfilePicture = profile?.personal_information.profilepicture
        ? `http://127.0.0.1:8000/storage/${profile.personal_information.profilepicture}`
        : null;

    const currentCoverPhoto = profile?.personal_information.coverphoto
        ? `http://127.0.0.1:8000/storage/${profile.personal_information.coverphoto}`
        : null;

    if (!profile) {
        return null; // Early return if profile is null
    }

    return (
        <Modal open={open} onClose={onClose}>
            <div className="flex flex-col items-center justify-center bg-white rounded shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-hidden">
                <Typography variant="h6" className="mb-4">Edit Profile</Typography>
                <form onSubmit={handleSubmit} className="w-full max-w-md p-4 overflow-auto">
                    <TextField
                        label="First Name"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Last Name"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        fullWidth
                        margin="normal"
                    />

                    {/* Current Profile Picture */}
                    {currentProfilePicture && (
                        <div className="mt-4">
                            <Typography variant="body2">Current Profile Photo:</Typography>
                            <img
                                src={currentProfilePicture}
                                alt="Current Profile"
                                className="w-32 h-32 object-cover rounded mt-1"
                            />
                        </div>
                    )}
                    <label className="block mb-2 mt-2">Change Profile Photo:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && setProfilePicture(e.target.files[0])}
                    />
                    {profilepicture && (
                        <div className="mt-2">
                            <Typography variant="body2">Selected Profile Photo:</Typography>
                            <img
                                src={URL.createObjectURL(profilepicture)}
                                alt="Profile Preview"
                                className="w-32 h-32 object-cover rounded mt-1"
                            />
                        </div>
                    )}

                    {/* Current Cover Photo */}
                    {currentCoverPhoto && (
                        <div className="mt-4">
                            <Typography variant="body2">Current Cover Photo:</Typography>
                            <img
                                src={currentCoverPhoto}
                                alt="Current Cover"
                                className="w-full h-20 object-cover rounded mt-1"
                            />
                        </div>
                    )}
                    <label className="block mb-2 mt-2">Change Cover Photo:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && setCoverPhoto(e.target.files[0])}
                    />
                    {coverphoto && (
                        <div className="mt-2">
                            <Typography variant="body2">Selected Cover Photo:</Typography>
                            <img
                                src={URL.createObjectURL(coverphoto)}
                                alt="Cover Preview"
                                className="w-full h-20 object-cover rounded mt-1"
                            />
                        </div>
                    )}

                    <div className="mt-4">
                        <Button type="submit" variant="contained" color="primary">Save</Button>
                        <Button onClick={onClose} variant="outlined" color="secondary" className="ml-2">Cancel</Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditProfileModal;
