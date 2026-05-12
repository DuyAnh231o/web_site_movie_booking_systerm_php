<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Showtime extends Model
{
    protected $fillable = ['movie_id', 'room_id', 'start_time', 'price'];

    public function movie() { return $this->belongsTo(Movie::class); }
    public function room() { return $this->belongsTo(Room::class); }
    public function bookings() { return $this->hasMany(Booking::class); }
}