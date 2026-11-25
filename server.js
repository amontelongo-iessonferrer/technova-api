const fs = require("fs");
const path = require("path");
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const NOMBRE = process.env.NOMBRE_SERVIDOR || "servidor-sin-nombre";

// Conexión con la base de datos. Los datos llegan en variables de entorno:
// nunca se escriben en el código.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
  connectTimeout: 5000,
  decimalNumbers: true,
  // Conexión cifrada con el certificado de Amazon RDS
  ssl:
    process.env.DB_SSL === "true"
      ? { ca: fs.readFileSync(path.join(__dirname, "rds-ca.pem")) }
      : undefined,
});

// Comprueba que la API y la base de datos responden
app.get("/api/salud", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ estado: "ok", baseDatos: "ok", servidor: NOMBRE });
  } catch (error) {
    console.error("Sin conexión con la base de datos:", error.message);
    res
      .status(503)
      .json({ estado: "error", baseDatos: "sin conexión", servidor: NOMBRE });
  }
});

app.get("/api", (req, res) => {
  res.json({ mensaje: `API de TechNova - ${NOMBRE}` });
});

// Lista de servicios, leída de la base de datos
app.get("/api/servicios", async (req, res) => {
  try {
    const [filas] = await pool.query(
      "SELECT id, nombre, descripcion, precio FROM servicios ORDER BY id",
    );
    res.json({ servidor: NOMBRE, servicios: filas });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "No se han podido leer los servicios" });
  }
});

// Guardar un mensaje del formulario de contacto
app.post("/api/contacto", async (req, res) => {
  const { nombre, email, mensaje } = req.body || {};

  if (!nombre || !email || !mensaje) {
    return res
      .status(400)
      .json({ error: "Nombre, email y mensaje son obligatorios" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "El email no es válido" });
  }

  try {
    // Consulta parametrizada: los valores van en los "?", nunca concatenados
    const [resultado] = await pool.query(
      "INSERT INTO mensajes (nombre, email, mensaje, servidor) VALUES (?, ?, ?, ?)",
      [nombre, email, mensaje, NOMBRE],
    );
    res.status(201).json({ id: resultado.insertId, guardadoPor: NOMBRE });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "No se ha podido guardar el mensaje" });
  }
});

// Últimos mensajes recibidos
app.get("/api/contacto", async (req, res) => {
  try {
    const [filas] = await pool.query(
      "SELECT id, nombre, email, mensaje, servidor, fecha FROM mensajes ORDER BY id DESC LIMIT 20",
    );
    res.json({ servidor: NOMBRE, mensajes: filas });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "No se han podido leer los mensajes" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`${NOMBRE} escuchando en el puerto ${PORT}`);
});
