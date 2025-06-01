<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_no',
        'customer_name',
        'customer_phone',
        'description',
        'category',
        'status',
        'technician_id',
        'notes',
    ];

    public function technician()
    {
        return $this->belongsTo(MaintenanceTechnician::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class, 'request_id');
    }
}
