<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ListingController extends Controller
{
    public function index()
    {
        try {
            $listings = DB::table('listings')->get();
            
            return response()->json([
                'source' => 'laravel',
                'listings' => $listings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'Failed to fetch listings: ' . $e->getMessage()
            ], 500);
        }
    }
}
