<?php
// owner_orders.php
// Servido por PHP sin modificar apariencia ni comportamiento.
// session_start();
// header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UAO Food - Órdenes del restaurante</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link href="assets/css/styles.css" rel="stylesheet"/>
</head>
<body>
  <div id="mainNavbar"></div>

  <main class="container my-5">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="mb-0"><i class="fas fa-clipboard-list me-2 text-warning"></i>Órdenes de mi restaurante</h2>
      <a class="btn btn-outline-secondary" href="owner_products.php"><i class="fas fa-box me-2"></i>Productos</a>
    </div>
    <div id="ownerOrders"></div>
  </main>

  <script src="assets/js/api.js"></script>
  <script src="assets/js/utils.js"></script>
  <script src="assets/js/cart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/owner_orders.js"></script>
</body>
</html>
