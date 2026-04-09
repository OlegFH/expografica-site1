<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = array('success' => false, 'message' => 'An error occurred');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $response['message'] = 'Method not allowed';
    echo json_encode($response);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    $response['message'] = 'Invalid JSON data';
    echo json_encode($response);
    exit();
}

$name = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
$phone = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
$email = isset($data['email']) ? trim(strip_tags($data['email'])) : '';
$comment = isset($data['comment']) ? trim(strip_tags($data['comment'])) : '';

if (empty($name) || empty($phone) || empty($email)) {
    http_response_code(400);
    $response['message'] = 'Please fill in all required fields';
    echo json_encode($response);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    $response['message'] = 'Invalid email format';
    echo json_encode($response);
    exit();
}

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

$to = 'expografica25@gmail.com';
$subject = 'Нова заявка з веб-сайту Expografica';

$emailBody = "Нова заявка з веб-сайту Expografica\n\n";
$emailBody .= "Ім'я: " . htmlspecialchars($name) . "\n";
$emailBody .= "Телефон: " . htmlspecialchars($phone) . "\n";
$emailBody .= "Email: " . htmlspecialchars($email) . "\n";
$emailBody .= "Коментар: " . htmlspecialchars($comment) . "\n\n";
$emailBody .= "Дата: " . date('Y-m-d H:i:s') . "\n";
$emailBody .= "IP адреса: " . $_SERVER['REMOTE_ADDR'] . "\n";

$headers = "From: " . $email . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$mailSent = mail($to, $subject, $emailBody, $headers);

if ($mailSent || $telegramResult) {
    $response['success'] = true;
    $response['message'] = 'Your application has been sent successfully';
    http_response_code(200);
} else {
    $response['success'] = false;
    $response['message'] = 'Failed to send application. Please try again later.';
    http_response_code(500);
}

echo json_encode($response);
exit();
?>
