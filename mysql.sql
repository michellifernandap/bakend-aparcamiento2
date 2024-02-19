DROP DATABASE IF EXISTS estacionamientodb;

CREATE DATABASE estacionamientodb
CHARACTER SET utf8mb4
COLLATE utf8mb4_spanish_ci;

USE estacionamientodb;

CREATE TABLE aparcamiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    planta VARCHAR(20) NOT NULL,
    numero INT NOT NULL,
    disponible BOOLEAN NOT NULL,
    precio_hora DECIMAL(4,2) NOT NULL
);

CREATE TABLE ticket (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aparcamiento_id INT NOT NULL,
    matricula VARCHAR(30) NOT NULL,
    precio_hora  DECIMAL(4, 2) NOT NULL,
    fecha_entrada DATETIME NOT NULL,
    fecha_salida DATETIME,
    total_pagar DECIMAL(5,2),
    FOREIGN KEY (aparcamiento_id) REFERENCES aparcamiento(id)
);

INSERT INTO aparcamiento (planta, numero, disponible, precio_hora) VALUES
('1', 1, true, 6),
('1', 2, true, 6),
('1', 3, true, 6),
('1', 4, true, 6),
('1', 5, true, 6),
('1', 6, true, 6),
('1', 7, true, 6),
('1', 8, true, 6),
('1', 9, true, 6),
('1', 10, true, 6),
('1', 11, true, 6),
('1', 12, true, 6),
('1', 13, true, 6),
('1', 14, true, 6),
('1', 15, true, 6),
('1', 16, true, 6),
('1', 17, true, 6),
('1', 18, true, 6),
('1', 19, true, 6),
('1', 20, true, 6),
('2', 21, true, 6),
('2', 22, true, 6),
('2', 23, true, 6),
('2', 24, true, 6),
('2', 25, true, 6),
('2', 26, true, 6),
('2', 27, true, 6),
('2', 28, true, 6),
('2', 29, true, 6),
('2', 30, true, 6),
('2', 31, true, 6),
('2', 32, true, 6),
('2', 33, true, 6),
('2', 34, true, 6),
('2', 35, true, 6),
('2', 36, true, 6),
('2', 37, true, 6),
('2', 38, true, 6),
('2', 39, true, 6),
('2', 40, true, 6);

select * from aparcamiento;

select * from ticket;

SELECT * FROM ticket WHERE fecha_salida IS NULL;
SELECT * FROM ticket WHERE fecha_salida IS NOT NULL;
