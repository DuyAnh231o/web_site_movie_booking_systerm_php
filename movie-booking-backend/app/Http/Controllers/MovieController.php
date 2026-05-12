<?php
// app/Http/Controllers/MovieController.php
namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    // GET /api/movies
    public function index(Request $request)
    {
        $query = Movie::query();

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $movies = $query->orderBy('release_date', 'desc')
            ->paginate($request->limit ?? 10);

        return response()->json([
            'data'       => $movies->items(),
            'total'      => $movies->total(),
            'page'       => $movies->currentPage(),
            'totalPages' => $movies->lastPage(),
        ]);
    }

    // GET /api/movies/:id
    public function show($id)
    {
        $movie = Movie::with([
            'showtimes.room.theater',
            'showtimes' => fn($q) => $q->orderBy('start_time'),
        ])->findOrFail($id);

        return response()->json($movie);
    }

    // POST /api/movies
    public function store(Request $request)
    {
        $request->validate([
            'title'        => 'required|string',
            'duration'     => 'required|integer',
            'release_date' => 'required|date',
        ]);

        $movie = Movie::create($request->only([
            'title', 'description', 'duration', 'release_date', 'poster_url',
        ]));

        return response()->json($movie, 201);
    }

    // PUT /api/movies/:id
    public function update(Request $request, $id)
    {
        $movie = Movie::findOrFail($id);
        $movie->update($request->only([
            'title', 'description', 'duration', 'release_date', 'poster_url',
        ]));

        return response()->json($movie);
    }

    // DELETE /api/movies/:id
    public function destroy($id)
    {
        Movie::findOrFail($id)->delete();
        return response()->json(['message' => "Đã xóa phim #{$id}"]);
    }
}