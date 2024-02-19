require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

app.use(express.json()); // Para parsear application/json


// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

//  Verificar conexión a la base de datos
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado a la base de datos MySQL');
});

app.get('/hola', (req, res) => {
  res.send('Hola Mundo');
});

//Endpoint que DEVUELVE TODOS LOS estacionamientos
app.get('/api/estacionamientos', (req, res) => {
  const query = 'SELECT * FROM aparcamiento';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener los datos de los parkings');
    } else {
      res.json(results);
    }
  });
});

//Endpoint para INSERTAR UN TICKET
app.post('/api/ingresar', async (req, res) => {
  const { matricula } = req.body;
  console.log(matricula);
  const query = 'SELECT * FROM aparcamiento WHERE disponible = TRUE ORDER BY RAND() LIMIT 1';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error al obtener los datos de los parkings');
    } else if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay plazas disponibles.' });
    } else {
      const aparcamientodisponible = results[0];
      const id = aparcamientodisponible.id;
      const precio_hora = aparcamientodisponible.precio_hora;
      const queryUpdate = 'UPDATE aparcamiento SET disponible = FALSE WHERE id = ?';
      db.query(queryUpdate, [id], (err, updateResults) => {
        if (err) {
          return res.status(500).send('Error al actualizar los datos del parking');
        } else {
          const queryInsertTicket = `
            INSERT INTO ticket (aparcamiento_id, matricula, fecha_entrada, precio_hora) 
            VALUES (?, ?, NOW(), ?)
          `;
          db.query(queryInsertTicket, [id, matricula, precio_hora], (err, insertResults) => {
            if (err) {
              return res.status(500).send('Error al insertar el ticket en la base de datos');
            } else {
              res.json({ success: true, aparcamiento: aparcamientodisponible, ticket: insertResults });
            }
          });
        }
      });
    }
  });
});

app.post('/api/salir', async (req, res) => {
  const seleccionarTicket = 'SELECT t.*, a.precio_hora FROM ticket t INNER JOIN aparcamiento a ON t.aparcamiento_id = a.id WHERE t.fecha_salida IS NULL ORDER BY RAND() LIMIT 1';

  db.query(seleccionarTicket, async (err, tickets) => {
    if (err || tickets.length === 0) {
      return res.json({ success: false, aparcamiento: -1 });
    } else {
      const ticket = tickets[0];

      // Calculamos los minutos estacionado y el total a pagar
      const calcularTotalPagar = `
        SELECT TIMESTAMPDIFF(MINUTE, fecha_entrada, NOW()) AS minutos,
        TIMESTAMPDIFF(MINUTE, fecha_entrada, NOW()) * (${ticket.precio_hora} / 60) AS total_pagar
        FROM ticket WHERE id = ${ticket.id}
      `;

      db.query(calcularTotalPagar, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Error al calcular el tiempo estacionado.' });
        }

        const { total_pagar } = result[0];

        // Actualizar ticket con fecha_salida y total_pagar
        const actualizarTicket = `
          UPDATE ticket SET fecha_salida = NOW(), total_pagar = ${total_pagar}
          WHERE id = ${ticket.id}
        `;
        db.query(actualizarTicket, (err, updateResult) => {
          if (err) {
            return res.status(500).json({ error: 'Error al actualizar el ticket.' });
          }

          // Actualización del aparcamiento
          const actualizarAparcamiento = `
            UPDATE aparcamiento SET disponible = TRUE WHERE id = ${ticket.aparcamiento_id}
          `;
          db.query(actualizarAparcamiento, (err, aparcamientoResult) => {
            if (err) {
              return res.status(500).json({ error: 'Error al actualizar el aparcamiento.' });
            }
            res.json({ success: true, aparcamiento: ticket.aparcamiento_id });
          });
        });
      });
    }
  });
});

//endpoint para obtener los tickets cerrados
app.get('/api/tickets-cerrados', (req, res) => {
  const query = 'SELECT * FROM ticket WHERE fecha_salida IS NOT NULL';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener los datos de los tickets');
    } else {
      res.json(results);
    }
  });
});
 
//endpoint para ingresos totales
app.get('/api/ingresos-totales', (req, res) => {
  const query = 'SELECT SUM(total_pagar) AS ingresosTotales FROM ticket WHERE fecha_salida IS NOT NULL';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send('Error al calcular los ingresos totales');
    } else {
      res.json(result[0]);
    }
  });
});






app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });