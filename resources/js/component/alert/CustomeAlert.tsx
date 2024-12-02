import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { CheckCircle, Error, Info, Warning } from "@mui/icons-material";

interface CustomAlertProps {
  open: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "warning"; // Alert types
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const iconStyles = {
  success: { icon: <CheckCircle color="success" />, color: "green" },
  error: { icon: <Error color="error" />, color: "red" },
  info: { icon: <Info color="info" />, color: "blue" },
  warning: { icon: <Warning color="warning" />, color: "orange" },
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  open,
  title,
  message,
  type = "info", // Default to "info"
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  const { icon, color } = iconStyles[type];

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <Box display="flex" alignItems="center" padding="16px">
        {icon}
        <DialogTitle sx={{ marginLeft: 2, color }}>{title}</DialogTitle>
      </Box>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {onCancel && (
          <Button onClick={onCancel} color="secondary" variant="outlined">
            {cancelText}
          </Button>
        )}
        <Button onClick={onConfirm} color="primary" variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomAlert;
