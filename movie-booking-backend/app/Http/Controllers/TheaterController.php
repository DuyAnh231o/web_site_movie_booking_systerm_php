<?php
// app/Http/Controllers/TheaterController.php
namespace App\Http\Controllers;

use App\Models\Theater;
use Illuminate\Http\Request;

class TheaterController extends Controller
{
    public function index()
    {
        return Theater::with('rooms')->orderBy('name')->get();
    }

    public function show($id)
    {
        return Theater::with('rooms.seats')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required', 'location' => 'required']);
        return Theater::create($request->only(['name', 'location']));
    }

    public function update(Request $request, $id)
    {
        $theater = Theater::findOrFail($id);
        $theater->update($request->only(['name', 'location']));
        return $theater;
    }

    public function destroy($id)
    {
        Theater::findOrFail($id)->delete();
        return response()->json(['message' => "Đã xóa rạp #{$id}"]);
    }
}

// ─────────────────────────────────────────────
// app/Http/Controllers/RoomController.php
namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Seat;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function byTheater($theaterId)
    {
        return Room::with('seats')->where('theater_id', $theaterId)->get();
    }

    public function show($id)
    {
        return Room::with(['theater', 'seats'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required', 'theater_id' => 'required|exists:theaters,id']);
        return Room::create($request->only(['name', 'theater_id']));
    }

    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);
        $room->update($request->only(['name']));
        return $room;
    }

    public function destroy($id)
    {
        Room::findOrFail($id)->delete();
        return response()->json(['message' => "Đã xóa phòng #{$id}"]);
    }

    // POST /api/rooms/:id/seats
    public function createSeats(Request $request, $id)
    {
        $request->validate(['seat_numbers' => 'required|array']);
        $room = Room::findOrFail($id);

        $data = array_map(fn($sn) => [
            'seat_number' => $sn,
            'room_id'     => $room->id,
            'created_at'  => now(),
            'updated_at'  => now(),
        ], $request->seat_numbers);

        Seat::insertOrIgnore($data);

        return response()->json(['message' => 'Đã tạo ghế', 'count' => count($data)]);
    }
}