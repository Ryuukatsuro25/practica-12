<?php
// reviews.php - Lista de reseñas por restaurante (solo añadido)
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UAO Food - Reseñas</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link href="assets/css/styles.css" rel="stylesheet"/>
</head>
<body>
  <div id="mainNavbar"></div>

  <main class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 id="restoName" class="mb-0">Reseñas</h3>
        <div class="text-warning" id="ratingSummary"></div>
      </div>
      <div>
        <a id="btnAddReview" class="btn btn-outline-success">Hacer reseña</a>
        <a class="btn btn-outline-secondary" href="restaurants.php">Volver</a>
      </div>
    </div>

    <div id="reviewsList" class="vstack gap-3"></div>
  </main>

  <script src="assets/js/api.js"></script>
  <script src="assets/js/utils.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/reviews.js"></script>
</body>
</html>
