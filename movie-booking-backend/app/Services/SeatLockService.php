<?php
// app/Services/SeatLockService.php
namespace App\Services;

use Illuminate\Support\Facades\Redis;

class SeatLockService
{
    private function key(int $showtimeId, string $seatId): string
    {
        return "seat:{$showtimeId}:{$seatId}";
    }

    // Lock ghế (NX — chỉ set nếu chưa tồn tại)
    public function lockSeat(int $showtimeId, string $seatId, int $userId): bool
    {
        $result = Redis::set(
            $this->key($showtimeId, $seatId),
            $userId,
            'EX', 300,  // TTL 5 phút
            'NX'        // Only set if Not eXists
        );

        return $result === 'OK';
    }

    // Unlock ghế (chỉ unlock nếu là owner)
    public function unlockSeat(int $showtimeId, string $seatId, int $userId): bool
    {
        $key   = $this->key($showtimeId, $seatId);
        $owner = Redis::get($key);

        if ($owner === (string) $userId) {
            Redis::del($key);
            return true;
        }

        return false;
    }

    // Kiểm tra ghế có bị lock không
    public function isSeatLocked(int $showtimeId, string $seatId): ?string
    {
        return Redis::get($this->key($showtimeId, $seatId));
    }

    // Lấy tất cả ghế đang lock của showtime
    public function getLockedSeats(int $showtimeId): array
    {
        $keys   = Redis::keys("seat:{$showtimeId}:*");
        $result = [];

        foreach ($keys as $key) {
            $parts  = explode(':', $key);
            $seatId = $parts[2] ?? '';
            $userId = Redis::get($key);

            if ($userId) {
                $result[] = ['seatId' => $seatId, 'userId' => $userId];
            }
        }

        return $result;
    }
}