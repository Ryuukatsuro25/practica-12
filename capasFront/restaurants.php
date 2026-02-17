<?php
// restaurants.php
// Servido por PHP sin modificar apariencia ni comportamiento.
// session_start();
// header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UAO Food - Restaurantes</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link href="assets/css/styles.css" rel="stylesheet"/>
</head>
<body>
  <div id="mainNavbar"></div>

  <main class="container my-5">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="mb-0"><i class="fas fa-store me-2 text-primary"></i>Restaurantes activos</h2>
      <a class="btn btn-outline-secondary" href="index.html"><i class="fas fa-arrow-left me-2"></i>Inicio</a>
    </div>

    <!-- Grid -->
    <div class="row g-4" id="restaurantsGrid"></div>
  </main>

  <script src="assets/js/api.js"></script>
  <script src="assets/js/utils.js"></script>
  <script src="assets/js/cart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/restaurants.js"></script>
</body>
</html>
