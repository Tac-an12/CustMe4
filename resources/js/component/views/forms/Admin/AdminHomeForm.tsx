import React, { useRef, useState, useEffect } from "react";
import Header from "../components/header";
import {
  CircularProgress,
  Paper,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import { useSalesReport } from "../../../context/SalesReportContext";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { jsPDF } from "jspdf";
// Import html2canvas-pro to replace html2canvas
import html2canvas from "html2canvas-pro";

// Register necessary chart components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminHomeForm = () => {
  const { salesReport, loading, error } = useSalesReport();

  const chartRefUsers = useRef<any>(null); // Ref for Users Pie Chart
  const chartRefSales = useRef<any>(null); // Ref for Sales Pie Chart

  // Helper function to safely format numbers
  const formatNumber = (value: any): string => {
    const numberValue = Number(value);
    return isNaN(numberValue) ? "0" : numberValue.toFixed(2); // Return a string, even if it's '0'
  };

  // Prepare data for Users Pie chart
  const usersPieChartData = {
    labels: ["Users", "Graphic Designers", "Printing Shops"],
    datasets: [
      {
        data: [
          salesReport ? salesReport.user_counts.users : 0,
          salesReport ? salesReport.user_counts.graphic_designers : 0,
          salesReport ? salesReport.user_counts.printing_shops : 0,
        ],
        backgroundColor: ["#FF5733", "#33FF57", "#3357FF"],
        hoverBackgroundColor: ["#FF6F42", "#36D77F", "#4C84D6"],
      },
    ],
  };

  // Prepare data for Sales Pie chart
  const salesPieChartData = {
    labels: ["Graphic Designer Sales", "Printing Provider Sales"],
    datasets: [
      {
        data: [
          salesReport ? formatNumber(salesReport.graphic_designer_sales) : "0", // Ensure it's a string
          salesReport ? formatNumber(salesReport.printing_provider_sales) : "0", // Ensure it's a string
        ],
        backgroundColor: ["#33FF57", "#3357FF"],
        hoverBackgroundColor: ["#36D77F", "#4C84D6"],
      },
    ],
  };

  // Function to generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Sales Report", 14, 16);

    // Function to add chart to PDF with a slight delay for rendering
    const addChartToPDF = (
      chartRef: React.RefObject<any>,
      yPosition: number
    ) => {
      if (chartRef.current) {
        // Use a small delay to ensure that the chart is fully rendered
        setTimeout(() => {
          html2canvas(chartRef.current, {
            logging: true, // Enable logging to troubleshoot
            useCORS: true, // Attempt to load cross-origin images (useful for external images)
            allowTaint: true, // Allow cross-origin tainting of images
            scale: 2, // Increase the resolution of the generated image
          }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            doc.addImage(imgData, "PNG", 14, yPosition, 180, 90); // Adjust position and size
          });
        }, 100); // Delay in milliseconds, you can adjust this based on your needs
      }
    };

    // Add Users Pie Chart to PDF
    addChartToPDF(chartRefUsers, 30);

    // Add Sales Pie Chart to PDF
    addChartToPDF(chartRefSales, 120);

    // Add text data (Users and Sales Distribution)
    doc.setFontSize(12);
    doc.text("Users Distribution", 14, 130);
    doc.text(
      `Users: ${salesReport ? salesReport.user_counts.users : 0}`,
      14,
      140
    );
    doc.text(
      `Graphic Designers: ${
        salesReport ? salesReport.user_counts.graphic_designers : 0
      }`,
      14,
      145
    );
    doc.text(
      `Printing Shops: ${
        salesReport ? salesReport.user_counts.printing_shops : 0
      }`,
      14,
      150
    );

    doc.text("Sales Distribution", 14, 160);
    doc.text(
      `Graphic Designer Sales: Php ${formatNumber(
        salesReport.graphic_designer_sales
      )}`,
      14,
      165
    );
    doc.text(
      `Printing Provider Sales: Php ${formatNumber(
        salesReport.printing_provider_sales
      )}`,
      14,
      170
    );
    doc.text(
      `Highest Sale: Php ${formatNumber(salesReport.highest_sale)}`,
      14,
      175
    );
    doc.text(
      `Total Sales: Php ${formatNumber(salesReport.total_sales)}`,
      14,
      180
    );

    // Save the PDF
    doc.save("Sales_Report.pdf");
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header />

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Sales Report</h1>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : error ? (
          // Error State
          <div className="text-red-500 text-center">{error}</div>
        ) : salesReport ? (
          // Render Pie Charts and Table
          <Grid container spacing={3}>
            {/* Users Pie Chart */}
            <Grid item xs={12} md={6}>
              <Paper className="p-4 shadow-lg">
                <Typography variant="h6" className="mb-4">
                  Users Distribution
                </Typography>
                <div ref={chartRefUsers}>
                  <Pie
                    data={usersPieChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (tooltipItem) => {
                              return `${tooltipItem.label}: ${tooltipItem.raw}`;
                            },
                          },
                        },
                        legend: {
                          position: "top",
                        },
                      },
                    }}
                  />
                </div>
              </Paper>
            </Grid>

            {/* Sales Pie Chart */}
            <Grid item xs={12} md={6}>
              <Paper className="p-4 shadow-lg">
                <Typography variant="h6" className="mb-4">
                  Sales Distribution
                </Typography>
                <div ref={chartRefSales}>
                  <Pie
                    data={salesPieChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (tooltipItem) => {
                              return `${tooltipItem.label}: Php ${tooltipItem.raw}`;
                            },
                          },
                        },
                        legend: {
                          position: "top",
                        },
                      },
                    }}
                  />
                </div>
              </Paper>
            </Grid>

            {/* Add a Button to Generate PDF */}
            <Grid item xs={12} className="mt-4">
              <Button variant="contained" color="primary" onClick={generatePDF}>
                Download PDF
              </Button>
            </Grid>
          </Grid>
        ) : (
          // No Data State
          <div className="text-gray-500 text-center">
            No sales data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomeForm;
