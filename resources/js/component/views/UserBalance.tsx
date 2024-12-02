import React, { useEffect } from "react";
import { useAdminPaymentContext } from "../context/AdminPaymentContext";
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from "@mui/material";
import Header from "./forms/components/header";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";

const PaymentsTable = () => {
  const {
    requests = [],
    loading,
    error,
    fetchRequestPayments,
  } = useAdminPaymentContext(); // Default to empty array
  const { user } = useAuth();

  useEffect(() => {
    if (requests.length === 0 && !loading) {
      fetchRequestPayments(); // Fetch data only if requests array is empty and not already loading
    }
  }, [requests.length, loading, fetchRequestPayments]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 font-medium mt-4">
        Error: {error}
      </div>
    );

  const handlePayment = async (requestId) => {
    try {
      const response = await apiService.post(`/payforproduct80/${requestId}`);
      if (response.data && response.data.checkout_url) {
        window.open(response.data.checkout_url, "_blank");
      } else {
        console.error(
          "Failed to get checkout URL:",
          response.data.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
    }
  };

  return (
    <div>
      <Header />
      <TableContainer component={Paper} className="shadow-md rounded-lg mt-20">
        {Array.isArray(requests) && requests.length > 0 ? (
          <Table>
            <TableHead className="bg-gray-300">
              <TableRow>
                <TableCell className="text-white font-semibold">ID</TableCell>
                <TableCell className="text-white font-semibold">
                  Request ID
                </TableCell>
                <TableCell className="text-white font-semibold">
                  Request Type
                </TableCell>
                <TableCell className="text-white font-semibold">
                  Amount
                </TableCell>
                <TableCell className="text-white font-semibold">
                  Status
                </TableCell>
                <TableCell className="text-white font-semibold">
                  Payment Method
                </TableCell>
                <TableCell className="text-white font-semibold">
                  Created At
                </TableCell>
                <TableCell className="text-white font-semibold">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) =>
                request.initial_payments?.map((payment) => (
                  <TableRow
                    key={payment.initial_payment_id}
                    className="hover:bg-gray-100"
                  >
                    <TableCell>{payment.initial_payment_id}</TableCell>
                    <TableCell>{payment.request_id}</TableCell>
                    <TableCell>{request.request_type}</TableCell>
                    <TableCell>
                      Php {parseFloat(payment.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-white ${
                          payment.status === "completed"
                            ? "bg-green-500"
                            : payment.status === "initiated"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell>{payment.payment_method || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    {user.role.rolename === "User" &&
                      payment.status !== "completed" &&
                      payment.status !== "refunded" &&
                      payment.status !== "pending" && (
                        <TableCell className="text-right">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handlePayment(payment.request_id)}
                          >
                            Pay Remaining 80%
                          </Button>
                        </TableCell>
                      )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center h-64">
            <Typography variant="h6" className="text-gray-500">
              No data available yet
            </Typography>
          </div>
        )}
      </TableContainer>
    </div>
  );
};

export default PaymentsTable;
