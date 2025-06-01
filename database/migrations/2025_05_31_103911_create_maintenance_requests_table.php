<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_no')->unique(); // หมายเลขคำขอ (เช่น REQ-20250001)
            $table->string('customer_name'); // ชื่อลูกค้า
            $table->string('customer_phone'); // เบอร์โทรลูกค้า
            $table->text('description'); // รายละเอียดปัญหา
            $table->string('category'); // หมวดหมู่
            $table->string('status')->default('pending'); // pending, in_progress, completed
            $table->unsignedBigInteger('technician_id')->nullable(); // ช่างที่รับผิดชอบ
            $table->text('notes')->nullable(); // หมายเหตุเพิ่มเติม
            $table->timestamps();

            $table->foreign('technician_id')->references('id')->on('maintenance_technicians')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('maintenance_requests');
    }
};
