<?php
// add_review.php - Formulario de reseña (añadido)
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UAO Food - Nueva Reseña</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link href="assets/css/styles.css" rel="stylesheet"/>
</head>
<body>
  <div id="mainNavbar"></div>

  <main class="container my-4" style="max-width:720px;">
    <h3 id="pageTitle" class="mb-3">Nueva reseña</h3>
    <form id="reviewForm" class="card shadow-sm">
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Calificación (1 - 5)</label>
          <div id="ratingInputs" class="d-flex gap-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="rating" value="1"> <label class="form-check-label">1</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="rating" value="2"> <label class="form-check-label">2</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="rating" value="3"> <label class="form-check-label">3</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="rating" value="4"> <label class="form-check-label">4</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="rating" value="5"> <label class="form-check-label">5</label>
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Comentario (opcional)</label>
          <textarea class="form-control" name="comment" rows="4" maxLength="1000" placeholder="Escribe tu comentario..." maxlength="1000" placeholder="Escribe tu comentario..."></textarea>
        </div>
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" name="is_anonymous" id="anonChk">
          <label class="form-check-label" for="anonChk">Publicar como anónimo</label>
        </div>
        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary">Guardar reseña</button>
          <a id="btnCancel" class="btn btn-outline-secondary">Cancelar</a>
        </div>
        <div id="formAlert" class="alert alert-danger mt-3 d-none"></div>
      </div>
    </form>
  </main>

  <script src="assets/js/api.js"></script>
  <script src="assets/js/utils.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/add_review.js"></script>
</body>
</html>
