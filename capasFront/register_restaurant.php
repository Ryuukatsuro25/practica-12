<?php
// register_restaurant.php
// Servido por PHP sin modificar apariencia ni comportamiento.
// session_start();
// header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UAO Food - Registro de Restaurante</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link href="assets/css/styles.css" rel="stylesheet"/>
</head>
<body>
  <div id="mainNavbar"></div>

  <main class="container my-5">
    <div class="row justify-content-center">
      <div class="col-lg-10 col-xl-8">
        <div class="card shadow border-0">
          <div class="card-header bg-warning">
            <h5 class="mb-0"><i class="fas fa-store me-2"></i>Registra tu restaurante</h5>
          </div>
          <div class="card-body">
            <form id="formRegisterRestaurant" class="needs-validation" novalidate>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label" for="owner_name">Tu nombre</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-id-card"></i></span>
                    <input id="owner_name" type="text" class="form-control" placeholder="Nombre del propietario" required/>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="username">Usuario</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                    <input id="username" type="text" class="form-control" placeholder="usuario_propietario" required/>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="email">Email</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                    <input id="email" type="email" class="form-control" placeholder="correo@uao.edu.co" required/>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="password">Contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    <input id="password" type="password" class="form-control" placeholder="••••••••" required/>
                  </div>
                </div>
              </div>

              <hr class="my-4"/>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label" for="restaurant_name">Nombre del restaurante</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-store"></i></span>
                    <input id="restaurant_name" type="text" class="form-control" placeholder="Mi Restaurante UAO" required/>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="logo_url">Logo (URL)</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-image"></i></span>
                    <input id="logo_url" type="url" class="form-control" placeholder="https://.../logo.png"/>
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label" for="restaurant_description">Descripción</label>
                  <textarea id="restaurant_description" rows="3" class="form-control" placeholder="Breve descripción del restaurante"></textarea>
                </div>
              </div>

              <div class="alert alert-info mt-4">
                <strong>Nota:</strong> al crear tu restaurante, tu usuario tendrá el rol <code>restaurant_owner</code> y quedará vinculado automáticamente para gestionar productos y pedidos.
              </div>

              <div class="d-flex gap-2">
                <a href="register.php" class="btn btn-outline-secondary"><i class="fas fa-arrow-left me-2"></i>Volver</a>
                <button class="btn btn-warning ms-auto" type="submit"><i class="fas fa-paper-plane me-2"></i>Registrar Restaurante</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script src="assets/js/api.js"></script>
  <script src="assets/js/utils.js"></script>
  <script src="assets/js/cart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/register_restaurant.js"></script>
</body>
</html>
