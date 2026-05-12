<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Seat extends Model
{
    protected $fillable = ['seat_number', 'room_id'];

    public function room() { return $this->belongsTo(Room::class); }
    public function bookingSeats() { return $this->hasMany(BookingSeat::class); }
}