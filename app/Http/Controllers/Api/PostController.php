<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    protected $postModel;

    function __construct()
    {
        $this->postModel = new Post();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $post = $this->postModel->create([
                'title' => $request->title,
                'content' => $request->content,
                'user_id' => Auth::id(),
            ]);

            Log::info('Created Post ID: ' . $post->post_id);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $imagePath = $image->store('images', 'public');
                    Image::create([
                        'image_path' => $imagePath,
                        'post_id' => $post->post_id,
                    ]);
                }
            }

            return response()->json(['post' => $post], 201);
        } catch (\Exception $e) {
            Log::error('Post creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while creating the post'], 500);
        }
    }

    public function displayPost(Request $request)
    {
        $perPage = $request->get('limit', 4);
        $page = $request->get('page', 1);

        $posts = Post::with(['images', 'user.role'])
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $posts->items(),
            'total' => $posts->total(),
            'last_page' => $posts->lastPage(),
        ]);
    }

    public function show($id)
    {
        $post = Post::with(['images', 'user.role'])->find($id);

        if (!$post) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        return response()->json($post);
    }

    public function updatePost(Request $request, $postId)
{
    // Log the raw request content for debugging
    Log::info('Raw request content:', ['content' => file_get_contents('php://input')]);

    // Log the request headers for debugging
    Log::info('Request headers:', $request->headers->all());

    // Log the request data for debugging
    Log::info('Request data:', $request->all());

    $request->validate([
        'title' => 'required|string|max:255',
        'content' => 'required|string',
        'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        'existingImages' => 'array',
    ]);

    try {
        $post = Post::findOrFail($postId);

        if ($post->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $post->title = $request->title;
        $post->content = $request->content;
        $post->save();

        $existingImages = $request->input('existingImages', []);
        $currentImages = $post->images->pluck('image_id')->toArray();

        $imagesToDelete = array_diff($currentImages, $existingImages);
        foreach ($imagesToDelete as $imageId) {
            $image = Image::findOrFail($imageId);
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePath = $image->store('images', 'public');
                Image::create([
                    'image_path' => $imagePath,
                    'post_id' => $post->post_id,
                ]);
            }
        }

        $updatedPost = Post::with(['images', 'user.role'])->find($post->post_id);

        return response()->json($updatedPost, 200);
    } catch (\Exception $e) {
        Log::error('Post update failed: ' . $e->getMessage());
        return response()->json(['error' => 'An error occurred while updating the post'], 500);
    }
}

    public function destroy(Post $post)
    {
        try {
            if ($post->user_id !== Auth::id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            foreach ($post->images as $image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            }

            $post->delete();

            return response()->json(['message' => 'Post deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting post: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete post'], 500);
        }
    }
}
