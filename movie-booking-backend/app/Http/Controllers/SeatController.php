<?php
// app/Http/Controllers/SeatController.php
namespace App\Http\Controllers;

use App\Services\SeatLockService;
use Illuminate\Http\Request;

class SeatController extends Controller
{
    public function __construct(private SeatLockService $seatLockService) {}

    // POST /api/seats/lock
    public function lock(Request $request)
    {
        $request->validate([
            'showtime_id' => 'required|integer',
            'seat_id'     => 'required|string',
        ]);

        $userId     = auth('api')->id();
        $showtimeId = $request->showtime_id;
        $seatId     = $request->seat_id;

        $locked = $this->seatLockService->isSeatLocked($showtimeId, $seatId);

        if ($locked) {
            return response()->json(['message' => 'Ghế đã có người giữ'], 400);
        }

        $success = $this->seatLockService->lockSeat($showtimeId, $seatId, $userId);

        if (!$success) {
            return response()->json(['message' => 'Không thể giữ ghế'], 400);
        }

        // Broadcast realtime
        broadcast(new \App\Events\SeatLocked($showtimeId, $seatId, $userId));

        return response()->json(['message' => 'Đã giữ ghế', 'seatId' => $seatId]);
    }

    // POST /api/seats/unlock
    public function unlock(Request $request)
    {
        $request->validate([
            'showtime_id' => 'required|integer',
            'seat_id'     => 'required|string',
        ]);

        $userId     = auth('api')->id();
        $showtimeId = $request->showtime_id;
        $seatId     = $request->seat_id;

        $success = $this->seatLockService->unlockSeat($showtimeId, $seatId, $userId);

        if (!$success) {
            return response()->json(['message' => 'Không thể bỏ ghế'], 400);
        }

        broadcast(new \App\Events\SeatUnlocked($showtimeId, $seatId));

        return response()->json(['message' => 'Đã bỏ ghế', 'seatId' => $seatId]);
    }

    // GET /api/seats/locked/:showtimeId
    public function locked($showtimeId)
    {
        $seats = $this->seatLockService->getLockedSeats((int) $showtimeId);
        return response()->json($seats);
    }
}