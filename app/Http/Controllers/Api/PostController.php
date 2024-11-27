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
            'price' => 'required|numeric|min:0',
            'quantity' => 'nullable|integer|min:0',
        ]);

        try {
            $post = $this->postModel->create([
                'title' => $request->title,
                'content' => $request->content,
                'price' => $request->price,
                'quantity' => $request->quantity,
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
            'price' => 'nullable|numeric|min:0',
            'quantity' => 'nullable|integer|min:0',
        ]);

        try {
            $post = Post::findOrFail($postId);

            if ($post->user_id !== Auth::id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $post->title = $request->title;
            $post->content = $request->content;
            $post->price = $request->price;
            $post->quantity = $request->quantity;

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
            // if ($post->user_id !== Auth::id()) {
            //     return response()->json(['error' => 'Unauthorized'], 403);
            // }

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

    public function getUserImages()
    {
        try {
            // Fetch all posts by the authenticated user
            $posts = Post::where('user_id', Auth::id())->with('images')->get();

            // Extract images from posts
            $images = $posts->flatMap(function ($post) {
                return $post->images;
            });

            // If you want to return unique images, you can use uniqueBy
            // $images = $images->unique('image_id'); // Assuming 'image_id' is the primary key of the Image model

            return response()->json(['images' => $images], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching user images: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching images'], 500);
        }
    }

    public function getMyPosts()
    {
        Log::info('getMyPosts method called'); // Log the method call
        try {
            $posts = Post::where('user_id', Auth::id())
                ->with(['images', 'user.role'])
                ->get();

            return response()->json(['posts' => $posts], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching user posts: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching your posts'], 500);
        }
    }

    public function getGraphicDesignerPosts()
    {
        Log::info('getDesignerPosts method called'); // Log the method call
        try {
            $posts = Post::whereHas('user', function ($query) {
                $query->whereHas('role', function ($roleQuery) {
                    $roleQuery->where('rolename', 'Graphic Designer');
                });
            })
                ->with(['images', 'user.role'])
                ->get();

            return response()->json(['posts' => $posts], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching Graphic Designer posts: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching Graphic Designer posts'], 500);
        }
    }

    public function getPrintingProviderPosts()
    {
        try {
            $posts = Post::whereHas('user', function ($query) {
                $query->whereHas('role', function ($roleQuery) {
                    $roleQuery->where('rolename', 'Printing Shop');
                });
            })
                ->with(['images', 'user.role'])
                ->get();

            return response()->json(['posts' => $posts], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching Printing Provider posts: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching Printing Provider posts'], 500);
        }
    }
    public function getClientPosts()
    {
        Log::info('getClientPosts method called'); // Log the method call
        try {
            $posts = Post::whereHas('user', function ($query) {
                $query->whereHas('role', function ($roleQuery) {
                    $roleQuery->where('rolename', 'User'); // Change 'Client' to the actual role name used in your database
                });
            })
                ->with(['images', 'user.role'])
                ->get();

            return response()->json(['posts' => $posts], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching Client posts: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching Client posts'], 500);
        }
    }
}
