document.addEventListener('DOMContentLoaded', () => {
  renderNavbar(); // from api.js
  const form = document.getElementById('formRegisterRestaurant');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      owner_name: document.getElementById('owner_name').value.trim(),
      username: document.getElementById('username').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value.trim(),
      restaurant_name: document.getElementById('restaurant_name').value.trim(),
      restaurant_description: document.getElementById('restaurant_description').value.trim(),
      logo_url: document.getElementById('logo_url').value.trim()
    };

    try {
      await apiPost('/auth/register-restaurant', payload);
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      window.location.href = 'login.php';
    } catch (err) {
      console.error(err);
      alert('Error en el registro: ' + (err.message || err));
    }
  });
});
