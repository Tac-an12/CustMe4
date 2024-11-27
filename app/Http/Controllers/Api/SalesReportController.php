<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InitialPayment;
use App\Models\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;  // Add the Log facade for debugging

class SalesReportController extends Controller
{
    public function generateSalesReport()
    {
        // Total sales (sum of all initial payments)
        $totalSales = InitialPayment::sum('amount');

        // Initialize the sales counters
        $graphicDesignerSales = 0;
        $printingProviderSales = 0;

        // Fetch all initial payments with the user relationship
        $initialPayments = InitialPayment::with('user') // Eager load user relationship
            ->get();

        // Loop through each payment
        foreach ($initialPayments as $payment) {
            // Check if the user_id is a Graphic Designer (role_id = 3) or Printing Shop (role_id = 4)
            if ($payment->user && in_array($payment->user->role_id, [3, 4])) {
                // Directly add to the respective sales category
                if ($payment->user->role_id == 3) {
                    $graphicDesignerSales += $payment->amount;
                } elseif ($payment->user->role_id == 4) {
                    $printingProviderSales += $payment->amount;
                }
            } else {
                // If the user_id is not a Graphic Designer or Printing Shop, check the request table
                $request = Request::find($payment->request_id);

                if ($request) {
                    // Get the target_user_id from the request (this could be a Graphic Designer or Printing Shop)
                    $targetUser = $request->targetUser;

                    // Debugging the target_user_id and payment amount
                    Log::debug('Target User ID: ' . ($targetUser ? $targetUser->id : 'None') .
                        ' | Amount: ' . $payment->amount);

                    // Check if the target_user_id is a Graphic Designer or Printing Shop
                    if ($targetUser && in_array($targetUser->role_id, [3, 4])) {
                        if ($targetUser->role_id == 3) {
                            $graphicDesignerSales += $payment->amount;
                        } elseif ($targetUser->role_id == 4) {
                            $printingProviderSales += $payment->amount;
                        }
                    }

                    // Also consider the user making the request, if the target is a Graphic Designer or Printing Shop
                    if ($request->user && in_array($request->user->role_id, [3, 4])) {
                        if ($request->user->role_id == 3) {
                            $graphicDesignerSales += $payment->amount;
                        } elseif ($request->user->role_id == 4) {
                            $printingProviderSales += $payment->amount;
                        }
                    }
                }
            }
        }

        // Highest single sale
        $highestSale = InitialPayment::max('amount');

        // Top Graphic Designers (using 'user' relationship for sorting)
        // $topGraphicDesigners = InitialPayment::with('user')
        //     ->select('user_id', DB::raw('SUM(amount) as total_sales'))
        //     ->groupBy('user_id')
        //     ->whereHas('user', function ($query) {
        //         $query->where('role_id', 3);  // Only Graphic Designers
        //     })
        //     ->orWhereHas('request', function ($query) {
        //         $query->where('target_user_id', DB::raw('user_id')) // Ensure target_user_id matches the user_id in the initial payment
        //             ->whereHas('targetUser', function ($subQuery) {
        //                 $subQuery->where('role_id', 3);  // Target user is a Graphic Designer
        //             });
        //     })
        //     ->orderByDesc('total_sales')
        //     ->take(5)
        //     ->get()
        //     ->map(function ($payment) {
        //         // Check if request exists before accessing its target_user_id
        //         if ($payment->request) {
        //             Log::debug('Top Graphic Designer - Payment User ID: ' . $payment->user_id . ' | Target User ID: ' . $payment->request->target_user_id);
        //         } else {
        //             Log::debug('Top Graphic Designer - Payment User ID: ' . $payment->user_id . ' | No request found');
        //         }

        //         // Add the payment amount to total_sales if the payment involves a graphic designer
        //         if ($payment->request && $payment->request->targetUser && $payment->request->target_user_id == $payment->user_id) {
        //             // Add the amount to the total sales for the target user (graphic designer)
        //             Log::debug('Adding amount to target user - Amount: ' . $payment->amount);
        //             $payment->total_sales += $payment->amount; // Add the amount to the total sales
        //         }

        //         return [
        //             'username' => $payment->user->username,  // Accessing the related user's username
        //             'total_sales' => $payment->total_sales,
        //         ];
        //     });


        // // Top Printing Shops (using 'user' relationship for sorting)
        // $topPrintingProviders = InitialPayment::with('user')
        //     ->select('user_id', DB::raw('SUM(amount) as total_sales'))
        //     ->groupBy('user_id')
        //     ->whereHas('user', function ($query) {
        //         $query->where('role_id', 4);  // Only Printing Shops
        //     })
        //     ->orWhereHas('request', function ($query) {
        //         $query->where('target_user_id', DB::raw('user_id')) // Ensure target_user_id matches the user_id in the initial payment
        //             ->whereHas('targetUser', function ($subQuery) {
        //                 $subQuery->where('role_id', 4);  // Target user is a Printing Shop
        //             });
        //     })
        //     ->orderByDesc('total_sales')
        //     ->take(5)
        //     ->get()
        //     ->map(function ($payment) {
        //         // Check if request exists before accessing its target_user_id
        //         if ($payment->request) {
        //             Log::debug('Top Printing Shop hello - Payment User ID: ' . $payment->user_id . ' | Target User ID: ' . $payment->request->target_user_id);
        //         } else {
        //             Log::debug('Top Printing Shop - Payment User ID: ' . $payment->user_id . ' | No request found');
        //         }
        //         if ($payment->request && $payment->request->targetUser && $payment->request->target_user_id == $payment->user_id) {
        //             // Add the amount to the total sales for the target user (graphic designer)
        //             Log::debug('Adding amount to target user - Amount: ' . $payment->amount);
        //             $payment->total_sales += $payment->amount; // Add the amount to the total sales
        //         }

        //         return [
        //             'username' => $payment->user->username,  // Accessing the related user's username
        //             'total_sales' => $payment->total_sales,
        //         ];
        //     });



        // User counts by role (using the 'users' model)
        $userCounts = DB::table('users')
            ->select('role_id', DB::raw('COUNT(*) as count'))
            ->whereIn('role_id', [2, 3, 4]) // Only Users, Graphic Designers, and Printing Shops
            ->groupBy('role_id')
            ->get()
            ->mapWithKeys(function ($item) {
                $roles = [2 => 'users', 3 => 'graphic_designers', 4 => 'printing_shops'];
                return [$roles[$item->role_id] => $item->count];
            });

        // Report data
        $report = [
            'total_sales' => $totalSales,
            'graphic_designer_sales' => $graphicDesignerSales,
            'printing_provider_sales' => $printingProviderSales,
            'highest_sale' => $highestSale,
            // 'top_graphic_designers' => $topGraphicDesigners,
            // 'top_printing_providers' => $topPrintingProviders,
            'user_counts' => $userCounts,
        ];

        // Return the report as a JSON response
        return response()->json($report);
    }
}
