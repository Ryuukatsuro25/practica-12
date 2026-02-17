<?php
// admin_users.php
// Servido por PHP sin modificar apariencia ni comportamiento.
// session_start();
// header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UAO Food - Admin Usuarios</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link href="assets/css/styles.css" rel="stylesheet"/>
</head>
<body>
  <div id="mainNavbar"></div>

  <main class="container my-5">
    <h2 class="mb-4"><i class="fas fa-users-gear me-2 text-secondary"></i>Administración de Usuarios</h2>

    <div id="adminUsers">
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-light"><strong><i class="fas fa-user-plus me-2"></i>Crear usuario</strong></div>
        <div class="card-body">
          <form id="formNewU" class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="uname">Nombre</label>
              <input id="uname" type="text" class="form-control" placeholder="Nombre del usuario" required/>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="uuser">Usuario</label>
              <input id="uuser" type="text" class="form-control" placeholder="usuario" required/>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="uemail">Email</label>
              <input id="uemail" type="email" class="form-control" placeholder="correo@uao.edu.co" required/>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="upass">Contraseña</label>
              <input id="upass" type="password" class="form-control" placeholder="••••••••" required/>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="urole">Rol</label>
              <select id="urole" class="form-select">
                <option value="client">client</option>
                <option value="restaurant_owner">restaurant_owner</option>
                <option value="super_admin">super_admin</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="urest">Restaurante (ID, si aplica)</label>
              <input id="urest" type="number" min="0" class="form-control" placeholder="ID de restaurante para owners"/>
            </div>
            <div class="col-12">
              <button class="btn btn-secondary" type="submit"><i class="fas fa-paper-plane me-2"></i>Crear</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-header bg-light"><strong><i class="fas fa-database me-2"></i>Listado</strong></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Usuario</th><th>Email</th><th>Rol</th><th>Restaurante</th><th style="width:120px;"></th>
                </tr>
              </thead>
              <tbody id="userRows"></tbody>
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
  <script src="assets/js/admin_users.js"></script>
</body>
</html>
