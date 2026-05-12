<?php
// database/migrations/2024_01_01_000003_create_theaters_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('theaters', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location');
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('theater_id')->constrained('theaters')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('seats', function (Blueprint $table) {
            $table->id();
            $table->string('seat_number');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->unique(['room_id', 'seat_number']);
            $table->timestamps();
        });

        Schema::create('showtimes', function (Blueprint $table) {
            $table->id();
            $table->dateTime('start_time');
            $table->decimal('price', 10, 2);
            $table->foreignId('movie_id')->constrained('movies')->onDelete('cascade');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('showtimes');
        Schema::dropIfExists('seats');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('theaters');
    }
};