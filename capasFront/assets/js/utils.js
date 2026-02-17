function renderNavbar() {
  const nav = document.getElementById('mainNavbar');
  if (!nav) return;
  nav.innerHTML = `
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container">
      <a class="navbar-brand" href="index.html">UAO Food</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link" href="restaurants.php">Restaurantes</a></li>
          <li class="nav-item"><a class="nav-link" href="orders.php">Mis pedidos</a></li>
          <li class="nav-item" data-role="restaurant_owner"><a class="nav-link" href="owner_orders.php">Órdenes (Mi Restaurante)</a></li>
          <li class="nav-item" data-role="restaurant_owner"><a class="nav-link" href="owner_products.php">Productos (Mi Restaurante)</a></li>
          <li class="nav-item" data-role="super_admin"><a class="nav-link" href="admin_restaurants.php">Admin Restaurantes</a></li>
          <li class="nav-item" data-role="super_admin"><a class="nav-link" href="admin_users.php">Admin Usuarios</a></li>
        </ul>
        <div class="d-flex align-items-center gap-3">
          <a class="btn btn-outline-primary position-relative" href="cart.php">
            Carrito <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="cartCount">0</span>
          </a>
          <span id="navUser" class="text-muted"></span>
          <a id="btnLogin" class="btn btn-outline-secondary" href="login.php">Ingresar</a>
          <button id="btnLogout" class="btn btn-outline-danger d-none">Salir</button>
        </div>
      </div>
    </div>
  </nav>`;
  navUserInfo();
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) btnLogout.addEventListener('click', () => { clearSession(); window.location.href = 'index.html'; });
}

document.addEventListener('DOMContentLoaded', renderNavbar);
