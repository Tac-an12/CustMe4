<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');

            // $table->unsignedBigInteger('request_id')->nullable();
            // $table->foreign('request_id')->references('request_id')->on('requests')->onDelete('cascade');

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unsignedBigInteger('receiver_id'); // New foreign key for the payment receiver
            $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');

            $table->unsignedBigInteger('initial_payment_id')->nullable(); // Link to initial payment
            $table->foreign('initial_payment_id')->references('initial_payment_id')->on('initial_payments')->onDelete('set null');

            $table->decimal('amount', 10, 2);
            $table->enum('status', ['initiated', 'completed', 'failed'])->default('initiated');
            $table->string('transaction_id')->nullable();
            $table->string('payment_method')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};