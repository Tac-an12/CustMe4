<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Rating;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RatingController extends Controller
{
    public function getRatings($ratedUserId)
    {
        $authUser = Auth::user();

        // Fetch all ratings for the profile being viewed and include the `username` of the user
        $ratings = Rating::where('rated_user_id', $ratedUserId)
            ->with('user:id,username') // Fetch only `id` and `username` from the `users` table
            ->get();

        // Find the logged-in user's rating if it exists
        $userRating = $ratings->where('user_id', $authUser->id)->first();

        // Separate the logged-in user's rating for display at the top
        $otherRatings = $ratings->where('user_id', '!=', $authUser->id);

        // Combine the logged-in user's rating at the top, followed by others
        $sortedRatings = $userRating ? $otherRatings->prepend($userRating) : $otherRatings;

        return response()->json($sortedRatings->values(), 200);
    }


    // Post a new rating
    public function postRating(Request $request)
    {
        $user = Auth::user();

        // Log the incoming request data
        Log::debug('Request Data:', $request->all());

        // Validate the incoming data
        $validated = $request->validate([
            'rated_user_id' => 'required|exists:users,id',
            'rating' => 'required|integer|between:1,5',
            'content' => 'required|string',
        ]);

        // Proceed to create the rating if validation passes
        $rating = Rating::create([
            'user_id' => $user->id,                    // Use the logged-in user's ID
            'rated_user_id' => $validated['rated_user_id'],
            'rating' => $validated['rating'],
            'content' => $validated['content'],
        ]);

        return response()->json($rating, 201);
    }


    // Edit a rating
    public function editRating(Request $request, $ratingId)
    {
        $user = Auth::user();

        $rating = Rating::with('user')->findOrFail($ratingId);

        if ($rating->user_id !== $user->id) {
            return response()->json(['message' => 'You can only edit your own ratings.'], 403);
        }

        $validatedData = $request->validate([
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $rating->update($validatedData);

        // Re-fetch the rating with the user relation after update
        $updatedRating = Rating::with('user')->find($ratingId);

        return response()->json($updatedRating);
    }
}
