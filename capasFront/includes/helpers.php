<?php
// includes/helpers.php
function esc(?string $v): string { return htmlspecialchars($v ?? '', ENT_QUOTES, 'UTF-8'); }

// Visual de estrellas desde un promedio (0..5)
function render_stars($avg): string {
    $avg = max(0.0, min(5.0, (float)$avg));
    $filled = (int)floor($avg);
    return str_repeat('★', $filled) . str_repeat('☆', 5 - $filled);
}

// Visual de estrellas desde entero 1..5
function render_stars_int(int $n): string {
    $n = max(0, min(5, (int)$n));
    return str_repeat('★', $n) . str_repeat('☆', 5 - $n);
}

// Si tu app usa otra ruta para ver el menú, cambia aquí solamente.
function menu_url(int $restaurantId): string {
    return 'menu.php?restaurant_id=' . $restaurantId;
}
