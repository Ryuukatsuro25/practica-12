<?php
// register.php
// Servido por PHP sin modificar apariencia ni comportamiento.
// session_start();
// header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UAO Food - Registro</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link href="assets/css/styles.css" rel="stylesheet"/>
</head>
<body>
  <div id="mainNavbar"></div>

  <main class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow border-0">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="fas fa-user-plus me-2"></i>Crear cuenta</h5>
          </div>
          <div class="card-body">
            <form id="formRegister" class="needs-validation" novalidate>
              <div class="mb-3">
                <label class="form-label" for="name">Nombre completo</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-id-card"></i></span>
                  <input id="name" type="text" class="form-control" placeholder="Tu nombre y apellido" required/>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="username">Usuario</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-user"></i></span>
                  <input id="username" type="text" class="form-control" placeholder="tu_usuario" required/>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="email">Email</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                  <input id="email" type="email" class="form-control" placeholder="tucorreo@uao.edu.co" required/>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="password">Contraseña</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-lock"></i></span>
                  <input id="password" type="password" class="form-control" placeholder="••••••••" required/>
                </div>
              </div>

              <button class="btn btn-primary w-100" type="submit"><i class="fas fa-user-check me-2"></i>Registrarme</button>

              <!-- Botón Eres Restaurante (con id para evitar inyección duplicada) -->
              <div class="mt-3">
                <a id="btnRegisterRestaurant" class="btn btn-outline-primary w-100" href="register_restaurant.php">
                  ¿Eres restaurante? Registra tu restaurante aquí
                </a>
              </div>

              <div class="text-center mt-3">
                <a class="btn btn-link" href="login.php">Ya tengo cuenta</a>
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
  <script src="assets/js/auth.js"></script>
</body>
</html>
