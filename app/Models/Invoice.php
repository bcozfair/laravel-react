<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'amount',
        'invoice_no',
        'issue_date',
        'due_date',
        'status',
        'items',
    ];
    
    public function request()
    {
        return $this->belongsTo(\App\Models\MaintenanceRequest::class, 'request_id');
    }
}
