<?php
// database/migrations/2024_01_01_000004_create_bookings_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['PENDING', 'CONFIRMED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('showtime_id')->constrained('showtimes')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('booking_seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('seat_id')->constrained('seats')->onDelete('cascade');
            $table->unique(['booking_id', 'seat_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_seats');
        Schema::dropIfExists('bookings');
    }
};