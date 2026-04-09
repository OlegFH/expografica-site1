<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set JSON header
header('Content-Type: application/json');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize response array
$response = array(
    'success' => false,
    'message' => 'An error occurred'
);

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $response['message'] = 'Method not allowed';
    echo json_encode($response);
    exit();
}

// Get JSON data from request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input data
if (!$data) {
    http_response_code(400);
    $response['message'] = 'Invalid JSON data';
    echo json_encode($response);
    exit();
}

// Extract and sanitize form data
$name = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
$phone = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
$email = isset($data['email']) ? trim(strip_tags($data['email'])) : '';
$comment = isset($data['comment']) ? trim(strip_tags($data['comment'])) : '';

// Validate required fields
if (empty($name) || empty($phone) || empty($email)) {
    http_response_code(400);
    $response['message'] = 'Please fill in all required fields';
    echo json_encode($response);
    exit();
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    $response['message'] = 'Invalid email format';
    echo json_encode($response);
    exit();
}

// Validate phone format (basic validation)
if (!preg_match('/^[\d\s\-\+\(\)]+$/', $phone)) {
    http_response_code(400);
    $response['message'] = 'Invalid phone format';
    echo json_encode($response);
    exit();
}

// Telegram configuration
$botToken = '8715937184:AAGakHAcXE81g6kmZH-r7NeVHRmof_nvvU4';
$chatId = '1033298262';

// Build Telegram message
$telegramMessage = "🚀 *Нова заявка з сайту Expografica*\n\n";
$telegramMessage .= "👤 *Ім'я:* " . $name . "\n";
$telegramMessage .= "📞 *Телефон:* " . $phone . "\n";
$telegramMessage .= "📧 *Email:* " . $email . "\n";
$telegramMessage .= "💬 *Коментар:* " . $comment . "\n\n";
$telegramMessage .= "📅 *Дата:* " . date('Y-m-d H:i:s');

// Send to Telegram
$telegramUrl = "https://api.telegram.org/bot{$botToken}/sendMessage";
$telegramData = [
    'chat_id' => $chatId,
    'text' => $telegramMessage,
    'parse_mode' => 'Markdown'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $telegramUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($telegramData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$telegramResult = curl_exec($ch);
curl_close($ch);

// Email configuration
$to = 'expografica25@gmail.com';
$subject = 'Нова заявка з веб-сайту Expografica';

// Build email body
$emailBody = "Нова заявка з веб-сайту Expografica\n\n";
$emailBody .= "Ім'я: " . htmlspecialchars($name) . "\n";
$emailBody .= "Телефон: " . htmlspecialchars($phone) . "\n";
$emailBody .= "Email: " . htmlspecialchars($email) . "\n";
$emailBody .= "Коментар: " . htmlspecialchars($comment) . "\n\n";
$emailBody .= "Дата: " . date('Y-m-d H:i:s') . "\n";
$emailBody .= "IP адреса: " . $_SERVER['REMOTE_ADDR'] . "\n";

// Email headers
$headers = "From: " . $email . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email
$mailSent = mail($to, $subject, $emailBody, $headers);

if ($mailSent || $telegramResult) {
    // Also send confirmation email to user
    $userSubject = 'Ваша заявка отримана - Expografica';
    $userBody = "Привіт " . htmlspecialchars($name) . "!\n\n";
    $userBody .= "Спасибо за вашу заявку. Ми отримали ваше повідомлення і незабаром з вами зв'яжемось.\n\n";
    $userBody .= "Деталі вашої заявки:\n";
    $userBody .= "Ім'я: " . htmlspecialchars($name) . "\n";
    $userBody .= "Телефон: " . htmlspecialchars($phone) . "\n";
    $userBody .= "Email: " . htmlspecialchars($email) . "\n";
    $userBody .= "Коментар: " . htmlspecialchars($comment) . "\n\n";
    $userBody .= "З найкращими побажаннями,\n";
    $userBody .= "Команда Expografica\n\n";
    $userBody .= "Контакти:\n";
    $userBody .= "Телефон: +380 93 751 74 52\n";
    $userBody .= "Telegram: @Expoprint_bot\n";
    $userBody .= "Email: expografica25@gmail.com\n";

    $userHeaders = "From: expografica25@gmail.com\r\n";
    $userHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Send confirmation email (non-critical, don't fail if it doesn't send)
    @mail($email, $userSubject, $userBody, $userHeaders);

    $response['success'] = true;
    $response['message'] = 'Your application has been sent successfully';
    http_response_code(200);
} else {
    $response['success'] = false;
    $response['message'] = 'Failed to send application. Please try again later.';
    http_response_code(500);
}

// Return JSON response
echo json_encode($response);
exit();
?>
