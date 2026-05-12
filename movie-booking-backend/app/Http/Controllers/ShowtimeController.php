<?php

namespace App\Http\Controllers;

use App\Models\Showtime;
use Illuminate\Http\Request;

class ShowtimeController extends Controller
{
    public function index(Request $request)
    {
        $query = Showtime::with([
            'movie',
            'room.theater'
        ]);

        if ($request->movie_id) {
            $query->where(
                'movie_id',
                $request->movie_id
            );
        }

        if ($request->room_id) {
            $query->where(
                'room_id',
                $request->room_id
            );
        }

        if ($request->date) {
            $query->whereDate(
                'start_time',
                $request->date
            );
        }

        return $query
            ->orderBy('start_time')
            ->get();
    }

    public function show($id)
    {
        return Showtime::with([
            'movie',
            'room.theater',
            'room.seats'
        ])->findOrFail($id);
    }
}