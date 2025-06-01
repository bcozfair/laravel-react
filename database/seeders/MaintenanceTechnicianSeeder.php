<?php

namespace Database\Seeders;

use App\Models\MaintenanceTechnician;
use Illuminate\Database\Seeder;

class MaintenanceTechnicianSeeder extends Seeder
{
    public function run()
    {
        MaintenanceTechnician::create(['name' => 'สมชาย ใจดี', 'specialty' => 'เครื่องปรับอากาศ', 'contact' => 'somchai@example.com']);
        MaintenanceTechnician::create(['name' => 'สมหญิง เก่งงาน', 'specialty' => 'คอมพิวเตอร์', 'contact' => 'somying@example.com']);
        MaintenanceTechnician::create(['name' => 'ประเสริฐ ช่างทอง', 'specialty' => 'สมาร์ทโฟน/แท็บเล็ต', 'contact' => 'prasert@example.com']);
        MaintenanceTechnician::create(['name' => 'สายใจ ช่างไฟ', 'specialty' => 'เครื่องใช้ไฟฟ้า', 'contact' => 'saijai@example.com']);
        MaintenanceTechnician::create(['name' => 'วิชัย ช่างซ่อม', 'specialty' => 'อื่นๆ', 'contact' => 'wichai@example.com']);
    }
}