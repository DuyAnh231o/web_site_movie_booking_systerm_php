<?php
// routes/api.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\TheaterController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ShowtimeController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\SeatController;
use App\Http\Controllers\AdminController;

// ─── Auth ───────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
    Route::get('google',          [AuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [AuthController::class, 'handleGoogleCallback']);

    Route::middleware('auth:api')->get('me', [AuthController::class, 'me']);
});

// ─── Public routes ──────────────────────────────
Route::get('movies',              [MovieController::class,    'index']);
Route::get('movies/{id}',         [MovieController::class,    'show']);
Route::get('showtimes',           [ShowtimeController::class, 'index']);
Route::get('showtimes/{id}',      [ShowtimeController::class, 'show']);
Route::get('showtimes/{id}/seats',[ShowtimeController::class, 'seats']);
Route::get('theaters',            [TheaterController::class,  'index']);
Route::get('theaters/{id}',       [TheaterController::class,  'show']);
Route::get('rooms/theater/{theaterId}', [RoomController::class, 'byTheater']);
Route::get('rooms/{id}',          [RoomController::class,     'show']);
Route::get('bookings/showtimes/{id}/seats', [ShowtimeController::class, 'seats']);

// ─── Authenticated routes ────────────────────────
Route::middleware('auth:api')->group(function () {
    // Seats realtime
    Route::post('seats/lock',            [SeatController::class,    'lock']);
    Route::post('seats/unlock',          [SeatController::class,    'unlock']);
    Route::get('seats/locked/{showtimeId}', [SeatController::class, 'locked']);

    // Bookings
    Route::get('bookings/user/{userId}', [BookingController::class, 'byUser']);
    Route::get('bookings/{id}',          [BookingController::class, 'show']);
    Route::post('bookings/confirm',      [BookingController::class, 'confirm']);
    Route::delete('bookings/{id}/cancel',[BookingController::class, 'cancel']);

    // Admin routes
    Route::middleware('role:ADMIN')->prefix('admin')->group(function () {
        Route::get('dashboard',          [AdminController::class, 'dashboard']);
        Route::get('users',              [AdminController::class, 'users']);
        Route::put('users/{id}/role',    [AdminController::class, 'updateUserRole']);
        Route::delete('users/{id}',      [AdminController::class, 'deleteUser']);
        Route::get('bookings',           [AdminController::class, 'bookings']);

        // CRUD phim
        Route::post('movies',            [MovieController::class,    'store']);
        Route::put('movies/{id}',        [MovieController::class,    'update']);
        Route::delete('movies/{id}',     [MovieController::class,    'destroy']);

        // CRUD theater/room
        Route::post('theaters',          [TheaterController::class,  'store']);
        Route::put('theaters/{id}',      [TheaterController::class,  'update']);
        Route::delete('theaters/{id}',   [TheaterController::class,  'destroy']);
        Route::post('rooms',             [RoomController::class,     'store']);
        Route::put('rooms/{id}',         [RoomController::class,     'update']);
        Route::delete('rooms/{id}',      [RoomController::class,     'destroy']);
        Route::post('rooms/{id}/seats',  [RoomController::class,     'createSeats']);

        // CRUD showtime
        Route::post('showtimes',         [ShowtimeController::class, 'store']);
        Route::put('showtimes/{id}',     [ShowtimeController::class, 'update']);
        Route::delete('showtimes/{id}',  [ShowtimeController::class, 'destroy']);
    });
});