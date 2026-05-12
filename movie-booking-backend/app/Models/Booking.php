<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = ['total_price', 'status', 'user_id', 'showtime_id'];

    public function user() { return $this->belongsTo(User::class); }
    public function showtime() { return $this->belongsTo(Showtime::class); }
    public function seats() { return $this->hasMany(BookingSeat::class); }
}