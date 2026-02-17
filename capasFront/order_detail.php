<?php
// order_detail.php
// Servido por PHP sin modificar apariencia ni comportamiento.
// session_start();
// header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Detalle de orden</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/css/styles.css" rel="stylesheet">
</head>
<body>
  <div id="mainNavbar"></div>
  <div class="container my-4">
    
<h2 id="title">Orden</h2>
<p id="meta" class="text-muted"></p>
<div id="detailContainer">
  <table class="table">
    <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th></tr></thead>
    <tbody id="items"></tbody>
  </table>
</div>

  </div>
  <script src="assets/js/api.js"></script>
  <script src="assets/js/utils.js"></script>
  <script src="assets/js/cart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/order_detail.js"></script>
</body>
</html>
