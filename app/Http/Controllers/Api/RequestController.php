<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Request as UserRequest;
use App\Models\Notification;
use App\Models\Post;
use App\Models\Timer;
use App\Events\NotificationEvent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Services\TimerService;
use App\Models\InitialPayment;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;



class RequestController extends Controller
{
    public function store(Request $request)
    {
        // Validate incoming request data
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'target_user_id' => 'required|exists:users,id',
            'post_id' => 'required|exists:posts,post_id',
            'content' => 'required|string', // This will be for the notification content
            'request_content' => 'required|string', // Validate request content for the requests table


        ]);

        // Debug log the validated input
        Log::info('Validated request data:', $validated);

        // Calculate the completion deadline based on duration


        // Log the payload that will be sent to the database
        Log::info('UserRequest payload:', [
            'user_id' => $validated['user_id'],
            'post_id' => $validated['post_id'],
            'target_user_id' => $validated['target_user_id'],
            'request_content' => $validated['request_content'],

        ]);

        // Create the user request and include duration information
        $userRequest = UserRequest::create([
            'user_id' => $validated['user_id'],
            'post_id' => $validated['post_id'],
            'target_user_id' => $validated['target_user_id'],
            'request_type' => 'product_request',
            'status' => 'pending',
            'request_content' => $validated['request_content'], // Store the request content here


        ]);

        // Log the created user request for debugging
        Log::info('Created user request:', $userRequest->toArray());

        // Create a notification for the target user
        $notification = Notification::create([
            'content' => $validated['content'], // Notification content
            'status' => 'unread',
            'user_id' => $validated['target_user_id'],
            'request_id' => $userRequest->request_id,
        ]);

        // Log the notification creation event
        Log::info('Notification created:', $notification->toArray());
        broadcast(new NotificationEvent($notification));

        return response()->json(['message' => 'Request created and notification sent.'], 201);
    }


    public function accept(Request $request, $requestId, $notificationId)
    {
        Log::info('Accept request method called with requestId: ' . $requestId . ' and notificationId: ' . $notificationId);
        try {
            // Find the request by ID
            $userRequest = UserRequest::findOrFail($requestId);
            $userRequest->status = 'accepted';
            $userRequest->save();

            $payment = InitialPayment::where('request_id', $requestId)->first(); // Find the first matching payment by foreign key
            if ($payment) {
                $payment->status = 'initiated'; // Update the payment status to 'refunded'
                $payment->save();
                Log::info('Updated payment status to refunded for request_id: ' . $requestId);
            } else {
                Log::error('No InitialPayment found with request_id: ' . $requestId);
                return response()->json(['error' => 'Payment not found'], 404); // Return error response if payment is not found
            }

            // Create a notification for the sender
            $notification = Notification::create([
                'content' => $request->user()->username . ' has accepted your request.',
                'status' => 'accepted',
                'user_id' => $userRequest->user_id,
                'target_user_id' => $userRequest->target_user_id,
                'request_id' => $userRequest->request_id,
            ]);

            Log::info('Accepted request and created notification: ' . json_encode($notification));
            event(new NotificationEvent($notification));

            return response()->json([
                'message' => 'Request accepted, sender notified in real time.',
                'notification' => $notification,  // Return the notification data
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in accept method: ' . $e->getMessage());
            return response()->json(['error' => 'Could not process request'], 500);
        }
    }

    public function decline(Request $request, $requestId, $notificationId)
    {
        Log::info('Decline request method called with requestId: ' . $requestId . ' and notificationId: ' . $notificationId);
        try {
            // Find the request by ID
            $userRequest = UserRequest::findOrFail($requestId);
            $userRequest->status = 'declined'; // Update the status
            $userRequest->save();

            // Find the initial payment related to this request
            $payment = InitialPayment::where('request_id', $requestId)->first();  // Find the first matching payment by foreign key
            if ($payment) {
                // Check if there's a valid checkout_session_id
                $checkoutSessionId = $payment->transaction_id;
                if ($checkoutSessionId) {
                    // Fetch the checkout session from PayMongo
                    $client = new \GuzzleHttp\Client();
                    $response = $client->get("https://api.paymongo.com/v1/checkout_sessions/{$checkoutSessionId}", [
                        'headers' => [
                            'Authorization' => 'Basic ' . base64_encode(config('services.paymongo.secret_key') . ':'),
                        ],
                    ]);

                    $checkoutSession = json_decode($response->getBody(), true);

                    // Debugging: Log the checkout session response
                    Log::info('Checkout session response: ' . json_encode($checkoutSession));

                    // Check if the response contains payment_id within the payments array
                    if (isset($checkoutSession['data']['attributes']['payments'][0]['id'])) {
                        $paymentId = $checkoutSession['data']['attributes']['payments'][0]['id']; // Extract payment_id

                        // Debugging: Log the extracted payment_id
                        Log::info('Payment ID extracted: ' . $paymentId);

                        // Create the refund request using the payment ID
                        $refundResponse = $client->request('POST', 'https://api.paymongo.com/v1/refunds', [
                            'body' => json_encode([
                                'data' => [
                                    'attributes' => [
                                        'payment_id' => $paymentId, // Use the correct payment_id from checkout session
                                        'amount' => $payment->amount * 100, // Refund the full amount (in centavos)
                                        'reason' => 'others',
                                    ]
                                ]
                            ]),
                            'headers' => [
                                'Authorization' => 'Basic ' . base64_encode(config('services.paymongo.secret_key') . ':'),
                                'Content-Type' => 'application/json',
                                'Accept' => 'application/json',
                            ]
                        ]);

                        $refundResult = json_decode($refundResponse->getBody(), true);
                        if (isset($refundResult['data']['id'])) {
                            // Refund successful, update the payment status to refunded
                            $payment->status = 'refunded';
                            $payment->save();
                            Log::info('Refund processed successfully for request_id: ' . $requestId);
                        } else {
                            Log::error('Refund failed for payment_id: ' . $paymentId);
                            return response()->json(['error' => 'Refund failed'], 500);
                        }
                    } else {
                        Log::error('Payment ID not found in the checkout session response for request_id: ' . $requestId);
                        return response()->json(['error' => 'Payment ID not found'], 404);
                    }
                } else {
                    Log::error('Checkout session ID not found for payment related to request_id: ' . $requestId);
                    return response()->json(['error' => 'Checkout session not found'], 404);
                }
            } else {
                Log::error('No InitialPayment found with request_id: ' . $requestId);
                return response()->json(['error' => 'Payment not found'], 404);
            }

            // Create a notification to notify the original sender about the declined request
            $notification = Notification::create([
                'content' => $request->user()->username . ' has declined your request, and the PHP amount of ' . number_format($payment->amount, 2) . ' has been successfully refunded.',
                'status' => 'unread',
                'user_id' => $userRequest->user_id, // Notify the original sender
                'target_user_id' => $userRequest->target_user_id,
                'request_id' => $userRequest->request_id,
            ]);

            Log::info('Declined request: ' . json_encode($notification));
            event(new NotificationEvent($notification)); // Fire event to notify in real-time

            return response()->json(['message' => 'Request declined, payment refunded, and sender notified.'], 200);
        } catch (\Exception $e) {
            Log::error('Error in decline method: ' . $e->getMessage());
            return response()->json(['error' => 'Could not process request'], 500);
        }
    }

    public function getAllRequests(Request $request)
    {
        // Get the logged-in user
        $user = Auth::user();

        // Fetch all requests related to the current user
        // You can modify this to fit your application's requirement: e.g. only requests for specific roles
        $requests = UserRequest::where('target_user_id', $user->id)
            ->orWhere('user_id', $user->id)
            ->with('user', 'targetUser') // Load relationships if needed
            ->get();

        // Return the requests with necessary details
        return response()->json([
            'requests' => $requests,
        ]);
    }

    public function userAccept(Request $request, $requestId, $notificationId)
    {
        try {

            $userRequest = UserRequest::findOrFail($requestId);
            $userRequest->status = 'accepted';
            $userRequest->save();

            $userId = auth()->id();
            Log::debug('User ID:', ['user_id' => $userId]);

            $userRequest = UserRequest::findOrFail($requestId);
            Log::debug('User Request:', ['request_id' => $requestId, 'user_request' => $userRequest]);

            $notification = Notification::findOrFail($notificationId); // Retrieve the notification
            Log::debug('Notification:', ['notification_id' => $notificationId, 'notification' => $notification]);

            // Ensure the target user is a Graphic Designer or Printing Provider
            if ($userRequest->target_user_id !== $userId) {
                Log::warning('Unauthorized user attempting to accept request', ['target_user_id' => $userRequest->target_user_id, 'user_id' => $userId]);
                return response()->json(['error' => 'Unauthorized.'], 403);
            }

            // Retrieve the initial payment record
            $initialPayment = InitialPayment::where('request_id', $requestId)->first();
            if (!$initialPayment) {
                Log::warning('Initial payment not found', ['request_id' => $requestId]);
                return response()->json(['error' => 'Initial payment not found.'], 404);
            }
            Log::debug('Initial Payment:', ['initial_payment' => $initialPayment]);

            // Update the InitialPayment status to "initiated"
            $initialPayment->status = 'initiated';
            $initialPayment->save();
            Log::debug('Initial Payment Status Updated:', ['status' => 'initiated']);

            // Check if price is available in the user request, otherwise get from the related post
            $price = $userRequest->price;

            if ($price === null && $userRequest->post_id) {
                // Fetch the price from the related Post using the foreign key post_id
                $post = Post::find($userRequest->post_id);
                if ($post && $post->price) {
                    $price = $post->price;
                    Log::debug('Price retrieved from Post:', ['price' => $price, 'post_id' => $userRequest->post_id]);
                } else {
                    Log::warning('Price not found in Post', ['post_id' => $userRequest->post_id]);
                    return response()->json(['error' => 'Price is missing in both the request and related post.'], 400);
                }
            }

            Log::debug('Price:', ['price' => $price]);

            // Calculate 20% of the price
            $paymentAmount = $price * 0.2;
            Log::debug('Calculated Payment Amount (20%):', ['payment_amount' => $paymentAmount]);

            // Update the payment amount in InitialPayment
            $initialPayment->update([
                'amount' => $paymentAmount,
            ]);
            Log::debug('Initial Payment Updated:', ['updated_payment_amount' => $paymentAmount]);

            // Create a PayMongo Checkout link
            $payMongoResponse = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode(env('PAYMONGO_SECRET_KEY') . ':'),
            ])->post('https://api.paymongo.com/v1/links', [
                'data' => [
                    'attributes' => [
                        'amount' => $paymentAmount * 100, // Amount in cents
                        'description' => 'Payment for request ' . $requestId,
                        'payment_method' => 'gcash',
                    ]
                ]
            ]);

            if ($payMongoResponse->failed()) {
                Log::error('PayMongo API request failed', ['response' => $payMongoResponse->json()]);
                return response()->json(['error' => 'Failed to create PayMongo link.'], 500);
            }

            // Return the checkout URL to open in a separate window
            $checkoutUrl = $payMongoResponse->json()['data']['attributes']['checkout_url'];
            Log::debug('Checkout URL:', ['checkout_url' => $checkoutUrl]);

            // Update the notification to mark the action taken (accepted)
            $notification->update([
                'status' => 'accepted',
            ]);
            Log::debug('Notification Updated:', ['notification_status' => 'accepted']);

            return response()->json([
                'message' => 'Request accepted successfully.',
                'checkout_url' => $checkoutUrl
            ]);
        } catch (\Exception $e) {
            Log::error('Error in userAccept method', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error accepting the request: ' . $e->getMessage()], 500);
        }
    }


    public function userDecline(Request $request, $requestId, $notificationId)
    {
        try {
            $userId = auth()->id();
            $userRequest = UserRequest::findOrFail($requestId);
            $notification = Notification::findOrFail($notificationId); // Retrieve the notification

            // Ensure the target user is a Graphic Designer or Printing Provider
            if ($userRequest->target_user_id !== $userId) {
                return response()->json(['error' => 'Unauthorized.'], 403);
            }

            // Update request status to 'failed'
            $userRequest->update([
                'status' => 'declined',
            ]);

            $payment = InitialPayment::where('request_id', $requestId)->first(); // Find the first matching payment by foreign key
            if ($payment) {
                $payment->status = 'refunded'; // Update the payment status to 'refunded'
                $payment->save();
                Log::info('Updated payment status to refunded for request_id: ' . $requestId);
            } else {
                Log::error('No InitialPayment found with request_id: ' . $requestId);
                return response()->json(['error' => 'Payment not found'], 404); // Return error response if payment is not found
            }

            $notification = Notification::create([
                'content' => $request->user()->username . ' has declined your request.',
                'status' => 'unread',
                'user_id' => $userRequest->user_id, // Notify the original sender
                'target_user_id' => $userRequest->target_user_id,
                'request_id' => $userRequest->request_id,
            ]);

            return response()->json([
                'message' => 'Request declined successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error declining the request: ' . $e->getMessage()], 500);
        }
    }
}
