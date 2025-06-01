<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceTechnician extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'specialty', 'contact'];
}