<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Define allowed origins (frontend URLs)
        $allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];

        $origin = $request->headers->get('Origin');
        
        // Check if the origin is in our allowed list, otherwise use wildcard for development
        $allowOrigin = '*';
        if ($origin && in_array($origin, $allowedOrigins)) {
            $allowOrigin = $origin;
        }

        // Handle preflight OPTIONS requests
        if ($request->getMethod() === "OPTIONS") {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $allowOrigin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, X-Token-Auth, Authorization, Accept, Application, X-CSRF-TOKEN, Origin')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400'); // 24 hours
        }

        $response = $next($request);

        // Add CORS headers to all responses
        $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, X-Token-Auth, Authorization, Accept, Application, X-CSRF-TOKEN, Origin');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '86400');

        return $response;
    }
}
