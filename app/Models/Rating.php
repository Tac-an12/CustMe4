<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'content',
        'user_id',
        'rated_user_id',
        'rating',
    ];

    /**
     * Get the user who made the rating.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who is being rated.
     */
    public function ratedUser()
    {
        return $this->belongsTo(User::class, 'rated_user_id');
    }
}
