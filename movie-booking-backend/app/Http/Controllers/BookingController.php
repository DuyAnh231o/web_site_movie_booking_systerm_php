<?php
// app/Http/Controllers/BookingController.php
namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Showtime;
use App\Models\Seat;
use App\Services\SeatLockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function __construct(private SeatLockService $seatLockService) {}

    // GET /api/bookings
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'showtime.movie', 'showtime.room.theater', 'seats.seat']);

        if ($request->user_id)   $query->where('user_id', $request->user_id);
        if ($request->status)    $query->where('status', $request->status);

        $bookings = $query->orderBy('created_at', 'desc')->paginate($request->limit ?? 10);

        return response()->json([
            'data'       => $bookings->map(fn($b) => $this->serialize($b)),
            'total'      => $bookings->total(),
            'totalPages' => $bookings->lastPage(),
        ]);
    }

    // GET /api/bookings/user/:userId
    public function byUser($userId)
    {
        $bookings = Booking::with(['showtime.movie', 'showtime.room.theater', 'seats.seat'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return $bookings->map(fn($b) => $this->serialize($b));
    }

    // GET /api/bookings/:id
    public function show($id)
    {
        $booking = Booking::with(['user', 'showtime.movie', 'showtime.room.theater', 'seats.seat'])
            ->findOrFail($id);

        return $this->serialize($booking);
    }

    // POST /api/bookings/confirm
    public function confirm(Request $request)
    {
        $request->validate([
            'showtime_id' => 'required|exists:showtimes,id',
            'seat_ids'    => 'required|array',
        ]);

        $userId     = auth('api')->id();
        $showtimeId = $request->showtime_id;
        $seatLabels = $request->seat_ids;

        // 1. Kiểm tra Redis lock
        foreach ($seatLabels as $seatId) {
            $owner = $this->seatLockService->isSeatLocked($showtimeId, $seatId);
            if (!$owner) {
                return response()->json(['message' => "Ghế {$seatId} chưa được giữ"], 400);
            }
            if ($owner !== (string) $userId) {
                return response()->json(['message' => "Ghế {$seatId} không thuộc về bạn"], 400);
            }
        }

        // 2. Lấy showtime
        $showtime = Showtime::findOrFail($showtimeId);

        // 3. Lấy seat IDs từ seatNumber
        $seats = Seat::where('room_id', $showtime->room_id)
            ->whereIn('seat_number', $seatLabels)
            ->get();

        if ($seats->count() !== count($seatLabels)) {
            return response()->json(['message' => 'Một số ghế không tồn tại'], 400);
        }

        // 4. Kiểm tra ghế chưa booked
        $alreadyBooked = \App\Models\BookingSeat::whereIn('seat_id', $seats->pluck('id'))
            ->whereHas('booking', fn($q) => $q->where('showtime_id', $showtimeId)->where('status', 'CONFIRMED'))
            ->exists();

        if ($alreadyBooked) {
            return response()->json(['message' => 'Một số ghế đã được đặt'], 400);
        }

        // 5. Tạo booking trong transaction
        $booking = DB::transaction(function () use ($userId, $showtimeId, $showtime, $seats, $seatLabels) {
            $booking = Booking::create([
                'user_id'     => $userId,
                'showtime_id' => $showtimeId,
                'total_price' => $showtime->price * count($seatLabels),
                'status'      => 'CONFIRMED',
            ]);

            foreach ($seats as $seat) {
                $booking->seats()->create(['seat_id' => $seat->id]);
            }

            return $booking;
        });

        // 6. Unlock Redis
        foreach ($seatLabels as $seatLabel) {
            $this->seatLockService->unlockSeat($showtimeId, $seatLabel, $userId);
        }

        // 7. Broadcast realtime
        broadcast(new \App\Events\SeatBooked($showtimeId, $seatLabels, $userId));

        return response()->json([
            'bookingId'  => (string) $booking->id,
            'totalPrice' => $booking->total_price,
        ]);
    }

    // DELETE /api/bookings/:id/cancel
    public function cancel($id)
    {
        $booking = Booking::findOrFail($id);
        $userId  = auth('api')->id();

        if ($booking->user_id !== $userId) {
            return response()->json(['message' => 'Không có quyền hủy'], 403);
        }

        if ($booking->status === 'CANCELLED') {
            return response()->json(['message' => 'Booking đã bị hủy'], 400);
        }

        $booking->update(['status' => 'CANCELLED']);
        return response()->json(['message' => 'Đã hủy booking']);
    }

    private function serialize(Booking $b): array
    {
        return [
            'id'          => (string) $b->id,
            'totalPrice'  => $b->total_price,
            'status'      => $b->status,
            'createdAt'   => $b->created_at,
            'userId'      => (string) $b->user_id,
            'movie'       => $b->showtime?->movie?->title,
            'theater'     => $b->showtime?->room?->theater?->name,
            'room'        => $b->showtime?->room?->name,
            'startTime'   => $b->showtime?->start_time,
            'seats'       => $b->seats->map(fn($s) => $s->seat?->seat_number)->toArray(),
        ];
    }
}