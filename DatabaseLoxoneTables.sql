-- Eliminar tabla si existe
DROP TABLE IF EXISTS usuari;

-- Crear tabla usuari sin referencia a empresa
CREATE TABLE usuari (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    dni VARCHAR(20) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    cognom1 VARCHAR(255) NOT NULL,
    cognom2 VARCHAR(255),
    telefon VARCHAR(20),
    tipus ENUM('hibrido', 'electrico') NOT NULL,
    saldo DECIMAL(10,2) NOT NULL,
    cargaMaxima DECIMAL(10,2) AS (saldo * (1 / 0.30)) STORED,
    cargaRestant DECIMAL(10,2) DEFAULT NULL,
    uid INT NOT NULL UNIQUE 
);

-- Insertar usuarios con valores por defecto hasta uid = 1050
INSERT INTO usuari (uid, dni, nom, cognom1, cognom2, telefon, tipus, saldo, cargaRestant)
VALUES 
    (1001, '00000000X', 'DefaultName', 'DefaultSurname1', 'DefaultSurname2', '000000000', 'hibrido', 0.00, 0.00);

-- Generar más registros hasta uid 1050
INSERT INTO usuari (uid, dni, nom, cognom1, cognom2, telefon, tipus, saldo, cargaRestant)
SELECT 
    1001 + t.n, '00000000X', 'DefaultName', 'DefaultSurname1', 'DefaultSurname2', '000000000', 'hibrido', 0.00, 0.00
FROM (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
    SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL
    SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL
    SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL
    SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25 UNION ALL
    SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30 UNION ALL
    SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL SELECT 34 UNION ALL SELECT 35 UNION ALL
    SELECT 36 UNION ALL SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL SELECT 40 UNION ALL
    SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44 UNION ALL SELECT 45 UNION ALL
    SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL SELECT 49
) t;

-- Eliminar triggers y procedures si existen antes de crearlos
DROP TRIGGER IF EXISTS before_insert_usuari;
DROP PROCEDURE IF EXISTS actualizarCargaRestant;

DELIMITER //

-- Crear un trigger para autoincrementar uid desde 1001
CREATE TRIGGER before_insert_usuari
BEFORE INSERT ON usuari
FOR EACH ROW
BEGIN
    IF NEW.uid IS NULL OR NEW.uid = 0 THEN
        SET NEW.uid = (SELECT IFNULL(MAX(uid), 1000) + 1 FROM usuari);
    END IF;
    
    -- Inicializar cargaRestant con el valor de cargaMaxima
    SET NEW.cargaRestant = NEW.saldo * (1 / 0.30);
END;
//

-- Crear un procedimiento almacenado para actualizar cargaRestant
CREATE PROCEDURE actualizarCargaRestant(
    IN p_id INT,
    IN p_energiaConsumida DECIMAL(10,2)
)
BEGIN
    UPDATE usuari
    SET cargaRestant = cargaRestant - p_energiaConsumida
    WHERE id = p_id;
END;
//

DELIMITER ;

