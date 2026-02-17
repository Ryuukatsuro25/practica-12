document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const btnLogout = document.getElementById('btnLogout');

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      clearSession();
      window.location.href = 'index.html';
    });
  }

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      try {
        const data = await apiPost('/auth/login', { username, password });
        setSession(data);
        window.location.href = 'index.html';
      } catch (err) {
        alert('Error de login: ' + (err.message || err));
      }
    });
  }

  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      try {
        await apiPost('/auth/register', { name, username, email, password });
        alert('Registro exitoso. Ahora inicia sesión.');
        window.location.href = 'login.php';
      } catch (err) {
        alert('Error de registro: ' + (err.message || err));
      }
    });
  }
});


// --- Inyección de botón "¿Eres restaurante?" en la página de registro ---
document.addEventListener('DOMContentLoaded', () => {
  const formRegister = document.getElementById('formRegister');
  if (formRegister && !document.getElementById('btnRegisterRestaurant')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'mt-3';
    const link = document.createElement('a');
    link.id = 'btnRegisterRestaurant';
    link.href = 'register_restaurant.php';
    link.className = 'btn btn-outline-primary w-100';
    link.textContent = '¿Eres restaurante? Registra tu restaurante aquí';
    wrapper.appendChild(link);
    formRegister.appendChild(wrapper);
  }
});

