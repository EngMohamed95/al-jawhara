<?php
/**
 * Tap Payments credentials — copy this file to tap-config.php on the server
 * (NOT in git — tap-config.php is gitignored) and fill in your real keys
 * from https://dashboard.tap.company → Developers → API Keys.
 *
 * Never put the secret key in the database or send it to the frontend —
 * it must only ever live in this file, on the server.
 */

// From Tap Dashboard, Test mode — starts with sk_test_
define('TAP_SECRET_KEY_TEST', 'REPLACE_WITH_YOUR_TAP_TEST_SECRET_KEY');

// From Tap Dashboard, Live mode — starts with sk_live_
define('TAP_SECRET_KEY_LIVE', 'REPLACE_WITH_YOUR_TAP_LIVE_SECRET_KEY');

// Full site URL with no trailing slash, used to build the redirect/webhook URLs
define('TAP_SITE_URL', 'https://al-jawhara.com');
