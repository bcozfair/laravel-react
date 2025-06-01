<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('request_id');
            $table->decimal('amount', 8, 2); // จำนวนเงิน
            $table->string('invoice_no')->unique(); // หมายเลขใบแจ้งหนี้
            $table->date('issue_date'); // วันที่ออกใบแจ้งหนี้
            $table->date('due_date'); // วันที่ครบกำหนดชำระ
            $table->string('status')->default('unpaid'); // unpaid, paid, cancelled
            $table->text('items')->nullable(); // รายการบริการในรูปแบบ JSON
            $table->timestamps();

            $table->foreign('request_id')->references('id')->on('maintenance_requests')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('invoices');
    }
};
