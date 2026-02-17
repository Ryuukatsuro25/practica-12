<?php
// admin_restaurants.php
// Servido por PHP sin modificar apariencia ni comportamiento.
// Si necesitas sesiones o control de acceso, puedes habilitarlos aquí.
// session_start();
// header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UAO Food - Admin Restaurantes</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link href="assets/css/styles.css" rel="stylesheet"/>
</head>
<body>
  <div id="mainNavbar"></div>

  <main class="container my-5">
    <h2 class="mb-4"><i class="fas fa-screwdriver-wrench me-2 text-secondary"></i>Administración de Restaurantes</h2>

    <div id="adminRest">
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-light"><strong><i class="fas fa-plus me-2"></i>Crear restaurante</strong></div>
        <div class="card-body">
          <form id="formNewR" class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="rname">Nombre</label>
              <input id="rname" type="text" class="form-control" placeholder="Nombre del restaurante" required/>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="rlogo">Logo (URL)</label>
              <input id="rlogo" type="url" class="form-control" placeholder="https://.../logo.png"/>
            </div>
            <div class="col-12">
              <label class="form-label" for="rdesc">Descripción</label>
              <textarea id="rdesc" rows="2" class="form-control" placeholder="Breve descripción"></textarea>
            </div>
            <div class="col-12">
              <button class="btn btn-secondary" type="submit"><i class="fas fa-paper-plane me-2"></i>Crear</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <strong><i class="fas fa-database me-2"></i>Listado</strong>
          <span class="small text-muted">Activar/Desactivar y editar</span>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Estado</th><th style="width:220px;"></th>
                </tr>
              </thead>
              <tbody id="restRows"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script src="assets/js/api.js"></script>
  <script src="assets/js/utils.js"></script>
  <script src="assets/js/cart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/admin_restaurants.js"></script>
</body>
</html>
