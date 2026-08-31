<?php
/*
|----------------------------------------------------------------------------
|  KMSIT COMPUTER · routes/api.php (Laravel 11)
|  Salin ke backend Laravel Anda. Kontrak endpoint ini SAMA PERSIS dengan
|  yang dipanggil frontend React di src/lib/services.ts.
|  Auth: Laravel Sanctum (token bearer) · DB: MySQL (lihat backend/.env.example)
|----------------------------------------------------------------------------
*/

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api as Api;

// ── Publik ──────────────────────────────────────────────────────────────────
Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'app' => config('app.name'),
    'db' => in_array(\DB::connection()->getDriverName(), ['mysql', 'mariadb']) ? 'mysql' : 'unsupported',
    'time' => now()->toIso8601String(),
]));

Route::post('/install', [Api\InstallController::class, 'store'])
    ->middleware('installer.open');           // menolak bila installed.lock ada

Route::prefix('public')->group(function () {
    Route::get('/settings', [Api\SettingController::class, 'publicSettings']);
    Route::get('/menus', [Api\MenuController::class, 'index']);
    Route::get('/home-sections', [Api\HomeSectionController::class, 'index']);
    Route::get('/courses', [Api\CourseController::class, 'index']);
    Route::get('/courses/{course:slug}', [Api\CourseController::class, 'show']);
    Route::get('/articles', [Api\ArticleController::class, 'index']);
    Route::get('/articles/{article:slug}', [Api\ArticleController::class, 'show']);
    Route::get('/news', [Api\NewsController::class, 'index']);
    Route::get('/news/{news:slug}', [Api\NewsController::class, 'show']);
    Route::get('/tutorials', [Api\TutorialController::class, 'index']);
    Route::get('/tutorials/{tutorial:slug}', [Api\TutorialController::class, 'show']);
    Route::get('/programs', [Api\ProgramController::class, 'index']);
    Route::get('/pages/{page:slug}', [Api\PageController::class, 'show']);
    Route::get('/org-structure', [Api\OrgController::class, 'index']);
    Route::get('/certificates/verify/{code}', [Api\CertificateController::class, 'verify']);
});

// ── Auth (Sanctum) ──────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login', [Api\AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/register', [Api\AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/google', [Api\AuthController::class, 'google']);
    Route::post('/forgot-password', [Api\AuthController::class, 'forgot'])->middleware('throttle:5,1');
    Route::post('/reset-password', [Api\AuthController::class, 'reset']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [Api\AuthController::class, 'me']);
        Route::post('/logout', [Api\AuthController::class, 'logout']);
        Route::put('/profile', [Api\AuthController::class, 'updateProfile']);
        Route::put('/password', [Api\AuthController::class, 'updatePassword']);
    });
});

// ── Terotentikasi ───────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // LMS — siswa
    Route::post('/courses/{course}/enroll', [Api\EnrollmentController::class, 'store']);
    Route::get('/enrollments', [Api\EnrollmentController::class, 'mine']);
    Route::post('/lessons/{lesson}/complete', [Api\LessonProgressController::class, 'complete']);
    Route::get('/quizzes/{quiz}/start', [Api\QuizController::class, 'start']);
    Route::post('/quizzes/{quiz}/submit', [Api\QuizController::class, 'submit']);
    Route::get('/attempts', [Api\QuizController::class, 'myAttempts']);
    Route::get('/my-certificates', [Api\CertificateController::class, 'mine']);
    Route::get('/my-payments', [Api\PaymentController::class, 'mine']);

    // Checkout & payment gateway (PaymentService: Tripay|Xendit|Stripe)
    Route::post('/checkout', [Api\CheckoutController::class, 'create']);
    Route::get('/checkout/{payment}/status', [Api\CheckoutController::class, 'status']);
    Route::post('/payments/webhook/{provider}', [Api\WebhookController::class, 'handle']); // publik via signature

    // Instruktur — dompet & pencairan
    Route::get('/instructor-wallet', [Api\WalletController::class, 'show']);
    Route::get('/instructor-wallet/transactions', [Api\WalletController::class, 'transactions']);
    Route::post('/withdrawals', [Api\WithdrawalController::class, 'store']);
    Route::get('/withdrawals', [Api\WithdrawalController::class, 'mine']);

    // Notifikasi & profil
    Route::get('/notifications', [Api\NotificationController::class, 'index']);
    Route::put('/notifications/read-all', [Api\NotificationController::class, 'readAll']);

    // ── Admin / Super Admin (Policy & Gate per aksi) ────────────────────────
    Route::middleware('ability:admin')->prefix('admin')->group(function () {
        Route::apiResource('users', Api\UserController::class);
        Route::apiResource('courses', Api\AdminCourseController::class);
        Route::apiResource('courses.modules', Api\ModuleController::class)->shallow();
        Route::apiResource('modules.lessons', Api\LessonController::class)->shallow();
        Route::apiResource('quizzes', Api\AdminQuizController::class);
        Route::apiResource('articles', Api\AdminArticleController::class);
        Route::apiResource('news', Api\AdminNewsController::class);
        Route::apiResource('tutorials', Api\AdminTutorialController::class);
        Route::apiResource('programs', Api\AdminProgramController::class);
        Route::apiResource('pages', Api\AdminPageController::class);
        Route::apiResource('menus', Api\AdminMenuController::class);
        Route::put('menus/{menu}/items/reorder', [Api\AdminMenuController::class, 'reorder']);

        Route::get('payments', [Api\PaymentController::class, 'index']);
        Route::post('payments/{payment}/confirm', [Api\PaymentController::class, 'confirm']);
        Route::get('transactions', [Api\TransactionReportController::class, 'index']);
        Route::get('withdrawals', [Api\WithdrawalController::class, 'index']);
        Route::put('withdrawals/{withdrawal}', [Api\WithdrawalController::class, 'update']);

        Route::apiResource('media', Api\MediaController::class)->only(['index', 'store', 'destroy']);

        Route::apiResource('org-units', Api\OrgUnitController::class);
        Route::apiResource('org-members', Api\OrgMemberController::class);
        Route::put('home-sections/reorder', [Api\HomeSectionController::class, 'reorder']);
        Route::apiResource('home-sections', Api\HomeSectionController::class)->except(['reorder']);
    });

    // ── Khusus Super Admin ──────────────────────────────────────────────────
    Route::middleware('ability:super-admin')->prefix('super-admin')->group(function () {
        Route::get('settings', [Api\SettingController::class, 'index']);
        Route::put('settings', [Api\SettingController::class, 'update']);
        Route::get('roles', [Api\RoleController::class, 'index']);
        Route::put('roles/{role}/permissions', [Api\RoleController::class, 'syncPermissions']);
        Route::apiResource('gateways', Api\GatewayController::class)->only(['index', 'update']);
        Route::apiResource('integrations', Api\IntegrationController::class)->only(['index', 'update']);
        Route::get('activity-logs', [Api\ActivityLogController::class, 'index']);
        Route::post('system/sync', [Api\SystemController::class, 'sync']);   // impor snapshot lokal → MySQL
        Route::get('system/backup.sql', [Api\SystemController::class, 'backup']);
    });
});
