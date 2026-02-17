<?php
// restaurant.php
// Servido por PHP sin modificar apariencia ni comportamiento.
// session_start();
// header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UAO Food - Restaurante</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link href="assets/css/styles.css" rel="stylesheet"/>
</head>
<body>
  <div id="mainNavbar"></div>

  <main class="container my-5">
    <!-- Header restaurante -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-auto">
            <img id="restoLogo" src="" alt="logo" class="rounded" style="height:80px;width:80px;object-fit:cover"/>
          </div>
          <div class="col">
            <h2 id="restoTitle" class="mb-1"></h2>
            <p id="restoDesc" class="text-muted mb-0"></p>
          </div>
          <div class="col-auto">
            <a href="restaurants.php" class="btn btn-outline-secondary"><i class="fas fa-arrow-left me-2"></i>Restaurantes</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Productos -->
    <div class="row g-4" id="productsGrid"></div>
  </main>

  <script src="assets/js/api.js"></script>
  <script src="assets/js/utils.js"></script>
  <script src="assets/js/cart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/restaurant.js"></script>
</body>
</html>
