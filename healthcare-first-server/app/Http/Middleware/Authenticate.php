<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
	/**
	 * Get the path the user should be redirected to when they are not authenticated.
	 */
	protected function redirectTo($request): ?string
	{
		return null; // Do not redirect; let the framework return a 401 JSON response
	}
} 