import React, { ReactNode, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Using the AuthContext to get the current user
import apiService from "../services/apiService";

interface PaymentData {
  initial_payment_id: number;
  request_id: number;
  user_id: number;
  amount: string;
  payment_type: string;
  status: string;
  transaction_id: string | null;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

interface RequestData {
  request_id: number;
  request_type: string;
  status: string;
  request_content: string;
  initial_payments: PaymentData[] | null; // Can be null or an array of payments
}

interface AdminPaymentContextType {
  requests: RequestData[]; // Requests now include payments
  loading: boolean;
  error: string | null;
  fetchRequestPayments: () => void; // Fetches all request payments
}

const AdminPaymentContext = React.createContext<
  AdminPaymentContextType | undefined
>(undefined);

export const AdminPaymentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = React.useState<RequestData[]>([]); // Storing requests with payments
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuth(); // Access logged-in user from context

  // Fetch Request Payments
  const fetchRequestPayments = async () => {
    if (!user?.id) return; // Ensure that user ID is available
    setLoading(true);
    try {
      const response = await apiService.get(
        `/user/${user.id}/requests-payments`
      );
      setRequests(response.data); // Store the requests along with payments in the state
      setError(null);
    } catch (err) {
      setError("Failed to fetch request payments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments once when the provider mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchRequestPayments();
    }
  }, [user]);

  return (
    <AdminPaymentContext.Provider
      value={{ requests, loading, error, fetchRequestPayments }}
    >
      {children}
    </AdminPaymentContext.Provider>
  );
};

// Hook to use AdminPaymentContext
export const useAdminPaymentContext = () => {
  const context = React.useContext(AdminPaymentContext);
  if (!context) {
    throw new Error(
      "useAdminPaymentContext must be used within an AdminPaymentProvider"
    );
  }
  return context;
};
