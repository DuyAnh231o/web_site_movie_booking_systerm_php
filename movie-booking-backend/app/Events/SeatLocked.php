<?php
// app/Events/SeatLocked.php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class SeatLocked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public int $showtimeId,
        public string $seatId,
        public int $userId,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("showtime.{$this->showtimeId}");
    }

    public function broadcastAs(): string { return 'seat.locked'; }

    public function broadcastWith(): array
    {
        return ['seatId' => $this->seatId, 'userId' => $this->userId];
    }
}

// ─────────────────────────────────────────────
// app/Events/SeatUnlocked.php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class SeatUnlocked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public int $showtimeId,
        public string $seatId,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("showtime.{$this->showtimeId}");
    }

    public function broadcastAs(): string { return 'seat.unlocked'; }
    public function broadcastWith(): array { return ['seatId' => $this->seatId]; }
}

// ─────────────────────────────────────────────
// app/Events/SeatBooked.php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class SeatBooked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public int $showtimeId,
        public array $seatIds,
        public int $userId,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("showtime.{$this->showtimeId}");
    }

    public function broadcastAs(): string { return 'seat.booked'; }
    public function broadcastWith(): array
    {
        return ['seatIds' => $this->seatIds, 'userId' => $this->userId];
    }
}