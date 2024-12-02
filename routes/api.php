<?php


use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AdminPaymentController;
use App\Http\Controllers\Api\SalesReportController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\PayMongoWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;



Route::middleware(['auth:sanctum'])->group(function () {
    Broadcast::routes();
    Route::get('/current-user', [UserApiController::class, 'currentUser']);
    Route::get('/users', [UserApiController::class, 'getUsers']);
    Route::post('/logout', [UserApiController::class, 'logout']);
    Route::post('/updateUsers/{userId}', [UserApiController::class, 'acceptUser']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/allposts', [PostController::class, 'displayPost']);
    Route::get('/posts/{post}', [PostController::class, 'show']);
    Route::put('/posts/{postId}', [PostController::class, 'updatePost']);
    Route::delete('/delete-posts/{post}', [PostController::class, 'destroy']);
    Route::post('/requests', [RequestController::class, 'store']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/users/{id}/profile', [UserApiController::class, 'getUserProfile']);
    // Route::get('/users/{id}/profile', [UserApiController::class, 'getOtherUserProfile']);
    Route::put('/users/{id}/updateprofile', [UserApiController::class, 'updateUserProfile']);
    Route::get('/user/images', [PostController::class, 'getUserImages']);
    Route::get('/users/artist-and-printing-provider', [UserApiController::class, 'getArtistAndPrintingProvider']);

    Route::put('/users/{id}/update-bio&skills', [UserApiController::class, 'updateUserBioSkills']);

    Route::get('/search-stores', [StoreController::class, 'searchStores']);
    Route::get('/getstores', [StoreController::class, 'getAllStores']);
    Route::post('/stores', [StoreController::class, 'saveStore']);
    Route::put('/stores/{id}', [StoreController::class, 'updateStore']);
    Route::delete('/stores/{id}', [StoreController::class, 'deleteStore']);
    Route::get('/stores/{id}', [StoreController::class, 'getStore']);

    Route::get('/chats', [ChatController::class, 'getMessages']);
    Route::post('/send-message', [ChatController::class, 'sendMessage']);
    Route::get('/user-chat-list', [ChatController::class, 'getUserChatList']);

    Route::get('/myposts', [PostController::class, 'getMyPosts']);
    Route::get('/designerposts', [PostController::class, 'getGraphicDesignerPosts']);
    Route::get('/providerposts', [PostController::class, 'getPrintingProviderPosts']);
    Route::get('/clientposts', [PostController::class, 'getClientPosts']);
    Route::get('/allposts', [PostController::class, 'displayPost']);


    Route::post('/requests/{requestId}/accept/{notificationId}', [RequestController::class, 'accept']);
    Route::post('/requests/{requestId}/decline/{notificationId}', [RequestController::class, 'decline']);
    Route::post('/user/accept/{requestId}/{notificationId}', [RequestController::class, 'userAccept']);
    Route::post('/user/decline/{requestId}/{notificationId}', [RequestController::class, 'userDecline']);

    Route::get('/userq/{userId}', [UserApiController::class, 'getUserData']);

    Route::get('/search-stores', [StoreController::class, 'searchStores']);

    Route::post('/broadcasting/auth', '\Illuminate\Broadcasting\BroadcastController@authenticate');

    Route::post('/initiate-payment', [PaymentController::class, 'initiatePayment'])->name('payment.initiate');
    Route::post('/pay-for-product', [PaymentController::class, 'payForProduct']);
    Route::post('/payforproduct80/{requestId}', [PaymentController::class, 'payForProduct80']);
    Route::post('/create-request', [PaymentController::class, 'createRequest']);



    Route::get('/payment-success', [PaymentController::class, 'paymentSuccess'])->name('payment.success');
    Route::post('paymongo/webhook', [PayMongoWebhookController::class, 'handleWebhook']);

    Route::get('/payment-failed', [PaymentController::class, 'paymentFailed'])->name('payment.failed');

    Route::get('/showrequests', [RequestController::class, 'getAllRequests']);

    Route::get('/admin/payments', [AdminPaymentController::class, 'index']);
    Route::post('/admin/payments/{paymentId}/approve', [AdminPaymentController::class, 'approve']);
    // Route::post('/user/submit-payment', [AdminPaymentController::class, 'submitPayment']);
    // Route::get('/user-balance/{userId}', [AdminPaymentController::class, 'getUserBalance']);

    Route::get('/user/{userId}/requests-payments', [PaymentController::class, 'getRequestsWithPayments']);
    Route::get('/sales-report', [SalesReportController::class, 'generateSalesReport']);

    Route::get('/ratings/{userId}', [RatingController::class, 'getRatings']);

    // Post a rating
    Route::post('/ratings', [RatingController::class, 'postRating']);

    // Edit a rating
    Route::put('/ratings/{ratingId}', [RatingController::class, 'editRating']);

    Broadcast::channel('chat.{receiverId}', function ($user, $receiverId) {
        return (int) $user->id === (int) $receiverId || (int) $user->id === (int) $receiverId;
    });
});





Route::get('/roles', [UserApiController::class, 'roles']);

Route::post('/login', [UserApiController::class, 'login']);
Route::post('/register', [UserApiController::class, 'register']);

Route::get('/user-skills', [SkillController::class, 'getAllUserSkills']);
Route::get('/printing-skills', [SkillController::class, 'getAllPrintingSkills']);
