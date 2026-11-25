-- Tablas y datos iniciales de TechNova

CREATE TABLE IF NOT EXISTS servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  precio DECIMAL(8,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  servidor VARCHAR(50),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO servicios (nombre, descripcion, precio) VALUES
  ('Desarrollo web', 'Creación de sitios y aplicaciones web a medida', 1200.00),
  ('Soporte técnico', 'Mantenimiento de equipos y resolución de incidencias', 45.00),
  ('Migración a la nube', 'Traslado de servicios y aplicaciones a AWS', 900.00),
  ('Auditoría de seguridad', 'Revisión de la seguridad de redes y aplicaciones', 650.00);