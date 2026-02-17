<?php
// owner_products.php
// Servido por PHP sin modificar apariencia ni comportamiento.
// session_start();
// header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UAO Food - Productos del restaurante</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link href="assets/css/styles.css" rel="stylesheet"/>
</head>
<body>
  <div id="mainNavbar"></div>

  <main class="container my-5">
    <h2 class="mb-4"><i class="fas fa-boxes-stacked me-2 text-warning"></i>Productos de mi restaurante</h2>

    <div id="ownerProducts">
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-light"><strong><i class="fas fa-plus me-2"></i>Crear producto</strong></div>
        <div class="card-body">
          <form id="formNewP" class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="pname">Nombre</label>
              <input id="pname" type="text" class="form-control" placeholder="Ej. Empanada horneada" required/>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="pprice">Precio</label>
              <input id="pprice" type="number" step="0.01" min="0" class="form-control" placeholder="5000" required/>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="pstock">Stock</label>
              <input id="pstock" type="number" min="0" class="form-control" placeholder="20" required/>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="pimg">Imagen (URL)</label>
              <input id="pimg" type="url" class="form-control" placeholder="https://.../producto.png"/>
            </div>
            <div class="col-12">
              <label class="form-label" for="pdesc">Descripción</label>
              <textarea id="pdesc" rows="2" class="form-control" placeholder="Breve descripción del producto"></textarea>
            </div>
            <div class="col-12">
              <button class="btn btn-warning" type="submit"><i class="fas fa-paper-plane me-2"></i>Crear</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-header bg-light"><strong><i class="fas fa-list me-2"></i>Listado</strong></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Disponible</th><th style="width:160px;"></th>
                </tr>
              </thead>
              <tbody id="prodRows"></tbody>
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
  <script src="assets/js/owner_products.js"></script>
</body>
</html>
