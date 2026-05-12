<?php
// app/Http/Controllers/AuthController.php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // POST /api/auth/register
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|string|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'USER',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'user'  => $this->serializeUser($user),
        ]);
    }

    // POST /api/auth/login
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Email hoặc mật khẩu không đúng'], 401);
        }

        return response()->json([
            'token' => $token,
            'user'  => $this->serializeUser(auth('api')->user()),
        ]);
    }

    // GET /api/auth/me
    public function me()
    {
        return response()->json($this->serializeUser(auth('api')->user()));
    }

    // GET /api/auth/google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // GET /api/auth/google/callback
    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::firstOrCreate(
            ['email' => $googleUser->email],
            [
                'name'     => $googleUser->name,
                'password' => Hash::make(str()->random(32)),
                'role'     => 'USER',
            ]
        );

        $token = JWTAuth::fromUser($user);
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        return redirect("{$frontendUrl}/auth/callback?token={$token}&userId={$user->id}&name=" . urlencode($user->name) . "&role={$user->role}");
    }

    private function serializeUser(User $user): array
    {
        return [
            'id'    => (string) $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ];
    }
}