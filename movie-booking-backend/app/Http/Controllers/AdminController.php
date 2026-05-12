<?php
// app/Http/Controllers/AdminController.php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Movie;
use App\Models\Booking;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // GET /api/admin/dashboard
    public function dashboard()
    {
        $totalMovies   = Movie::count();
        $totalUsers    = User::count();
        $totalBookings = Booking::where('status', 'CONFIRMED')->count();
        $totalRevenue  = Booking::where('status', 'CONFIRMED')->sum('total_price');

        $recentBookings = Booking::with(['user', 'showtime.movie', 'seats.seat'])
            ->where('status', 'CONFIRMED')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(fn($b) => [
                'id'         => (string) $b->id,
                'totalPrice' => $b->total_price,
                'createdAt'  => $b->created_at,
                'user'       => ['id' => (string) $b->user->id, 'name' => $b->user->name, 'email' => $b->user->email],
                'movie'      => $b->showtime?->movie?->title,
                'seats'      => $b->seats->map(fn($s) => $s->seat?->seat_number)->toArray(),
            ]);

        return response()->json(compact('totalMovies', 'totalUsers', 'totalBookings', 'totalRevenue', 'recentBookings'));
    }

    // GET /api/admin/users
    public function users(Request $request)
    {
        $query = User::withCount('bookings');

        if ($request->search) {
            $query->where(fn($q) => $q
                ->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")
            );
        }
        if ($request->role) $query->where('role', $request->role);

        $users = $query->orderBy('created_at', 'desc')->paginate($request->limit ?? 10);

        return response()->json([
            'data'       => $users->map(fn($u) => [
                'id'           => (string) $u->id,
                'name'         => $u->name,
                'email'        => $u->email,
                'role'         => $u->role,
                'createdAt'    => $u->created_at,
                'bookingCount' => $u->bookings_count,
            ]),
            'total'      => $users->total(),
            'totalPages' => $users->lastPage(),
        ]);
    }

    // PUT /api/admin/users/:id/role
    public function updateUserRole(Request $request, $id)
    {
        $request->validate(['role' => 'required|in:USER,ADMIN']);
        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);
        return response()->json(['id' => (string) $user->id, 'role' => $user->role]);
    }

    // DELETE /api/admin/users/:id
    public function deleteUser($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => "Đã xóa user #{$id}"]);
    }

    // GET /api/admin/bookings
    public function bookings(Request $request)
    {
        $query = Booking::with(['user', 'showtime.movie', 'showtime.room.theater', 'seats.seat']);

        if ($request->status) $query->where('status', $request->status);

        $bookings = $query->orderBy('created_at', 'desc')->paginate($request->limit ?? 10);

        return response()->json([
            'data'       => $bookings->map(fn($b) => [
                'id'         => (string) $b->id,
                'totalPrice' => $b->total_price,
                'status'     => $b->status,
                'createdAt'  => $b->created_at,
                'user'       => ['id' => (string) $b->user->id, 'name' => $b->user->name, 'email' => $b->user->email],
                'movie'      => $b->showtime?->movie?->title,
                'theater'    => $b->showtime?->room?->theater?->name,
                'room'       => $b->showtime?->room?->name,
                'startTime'  => $b->showtime?->start_time,
                'seats'      => $b->seats->map(fn($s) => $s->seat?->seat_number)->toArray(),
            ]),
            'total'      => $bookings->total(),
            'totalPages' => $bookings->lastPage(),
        ]);
    }
}