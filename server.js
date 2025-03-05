const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const port = 3080;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'loxone'
});

app.use(express.json());
app.use(cors());

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Para la autenticación: usuario admin con contraseña "15j792kh"
const adminUsername = 'admin';
const adminHashedPassword = hashPassword('15j792kh');

const authString = Buffer.from('admin:15j792kh').toString('base64'); // Para peticiones a los endpoints de Loxone

const powerUrl = 'http://192.168.1.31/jdev/sps/io/1d1eadcb-01b4-f7e8-ffffba0581a3709c/state';
const NFCIDUrl = 'http://192.168.1.31/jdev/sps/io/1d3505f3-039e-8cbf-ffffba0581a3709c/state';
const vehicleConnectedUrl = 'http://192.168.1.31/jdev/sps/io/1d3e0a78-00be-871b-ffffba0581a3709c/state';

let currentPower = null;
let currentNFCID = null;
let connectedValue = null;
let lastConnectedValue = null;
let lastcharge = null;

let finaluid = null;
let finalname = null;
let finalfSurname = null;
let finalsSurname = null;
let finaldni = null;
let finaltype = null;
let finalsaldo = null;
let finaltel = null;

const fetchData = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Basic ${authString}`
            }
        });
        return response.data.LL.value;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error.message);
        return null;
    }
};

const updateValues = async () => {
    console.log('---------------------------------------------');
    console.log('Starting updateValues...');
    currentPower = await fetchData(powerUrl);
    console.log(`currentPower: ${currentPower}`);

    currentNFCID = await fetchData(NFCIDUrl);
    console.log(`currentNFCID: ${currentNFCID}`);

    connectedValue = await fetchData(vehicleConnectedUrl);
    console.log(`connectedValue: ${connectedValue}`);

    if (connectedValue == 1) {
        console.log('Vehicle connected');
        lastConnectedValue = 1;
        lastcharge = currentPower;
        console.log(`lastCharge: ${lastcharge}`);
    } else {
        console.log('Vehicle disconnected');
        if (lastConnectedValue == 1) {
            console.log('Updating saldo restant as the vehicle was connected previously...');
            updateSaldoRestant(lastcharge, currentNFCID);
            lastConnectedValue = 0;
        } else {
            console.log('Vehicle was not connected previously. No action needed.');
        }
    }
    console.log(`lastConnectedValue updated to: ${lastConnectedValue}`);
};

// Actualiza los valores cada 20 segundos
setInterval(updateValues, 20000);

function updateUser(uid, name, fSurname, sSurname, dni, saldo, type, tel) {
    const query = 'UPDATE usuari SET dni=?, nom=?, cognom1=?, cognom2=?, telefon=?, tipus=?, saldo=? WHERE uid=?';
    const values = [dni, name, fSurname, sSurname, tel, type, saldo, uid];

    console.log("Updating user with:", uid, name, fSurname, sSurname, dni, saldo, type, tel);

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating user: ', err);
            return;
        }

        console.log('User updated successfully: ', results);

        const query2 = 'SELECT cargaMaxima FROM usuari WHERE uid=?';
        connection.query(query2, [uid], (err, results) => {
            if (err) {
                console.log('Error: ', err);
                return;
            }
            const cargaMax = results[0].cargaMaxima;
            console.log("cargaMaxima:", cargaMax);

            const query3 = 'UPDATE usuari SET cargaRestant=? WHERE uid=?';
            connection.query(query3, [cargaMax, uid], (err, results) => {
                if (err) {
                    console.error('Error updating user: ', err);
                    return;
                }
                console.log('User updated successfully: ', results);
            });
        });
    });
}

function updateSaldoRestant(lastCharge, id) {
    console.log(`Updating saldo restant. lastCharge: ${lastCharge}, id: ${id}`);
    const selectQuery = 'SELECT uid, cargaRestant FROM usuari WHERE id=?';
    const updateQuery = 'UPDATE usuari SET cargaRestant=? WHERE uid=?';

    const numericId = parseInt(id, 10) + 1;
    console.log(`Running SELECT query: ${selectQuery} with id: ${numericId}`);

    connection.query(selectQuery, [numericId], (err, results) => {
        if (err) {
            console.error('Error fetching cargaRestant:', err);
            return;
        }
        if (!results.length) {
            console.error('No user found with the given id');
            return;
        }
        const cargaOldRest = results[0].cargaRestant;
        const uidprueba = results[0].uid;
        console.log(`cargaOldRest: ${cargaOldRest}`);

        const cargaNewRest = cargaOldRest - lastCharge;
        console.log(`cargaNewRest calculated as: ${cargaNewRest}`);
        console.log(`uid is: ${uidprueba}`);

        console.log(`Running UPDATE query: ${updateQuery} with values: [${cargaNewRest}, ${uidprueba}]`);
        connection.query(updateQuery, [cargaNewRest, uidprueba], (err, results) => {
            if (err) {
                console.error('Error updating user:', err);
                return;
            }
            console.log('User updated successfully:', results);
        });
    });
}

app.get('/uid', (req, res) => {
    const query = 'SELECT uid FROM usuari';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('database query error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const formattedResults = {};
        results.forEach((result, index) => {
            formattedResults[`uid${index + 1}`] = result.uid;
        });

        res.json(formattedResults);
    });
});

app.get('/maxConsumo', (req, res) => {
    const query = 'SELECT cargaRestant FROM usuari';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('database query error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const formattedResults = {};
        results.forEach((result, index) => {
            formattedResults[`cargaRes usuari${index + 1}`] = result.cargaRestant;
        });

        res.json(formattedResults);
    });
});

app.post('/cambiar-dades', async (req, res) => {
    const clientData = {
        uid: req.body.uid,
        name: req.body.name,
        fSurname: req.body.fSurname,
        sSurname: req.body.sSurname,
        dni: req.body.dni,
        saldo: req.body.saldo,
        type: req.body.type,
        tel: req.body.tel
    };

    console.log(clientData);

    finaluid = clientData.uid;
    finalname = clientData.name;
    finalfSurname = clientData.fSurname;
    finalsSurname = clientData.sSurname;
    finaldni = clientData.dni;
    finalsaldo = clientData.saldo;
    finaltype = clientData.type;
    finaltel = clientData.tel;

    updateUser(finaluid, finalname, finalfSurname, finalsSurname, finaldni, finalsaldo, finaltype, finaltel);
    res.status(200).json({ message: 'Datos actualizados' });
});

app.post('/reset-user', (req, res) => {
    const uid = req.body.uid;
    const defaultValues = {
        dni: '00000000X',
        nom: 'DefaultName',
        cognom1: 'DefaultSurname1',
        cognom2: 'DefaultSurname2',
        telefon: '000000000',
        tipus: 'hibrido',
        saldo: 0.00,
        cargaRestant: 0.00
    };

    const query = 'UPDATE usuari SET dni=?, nom=?, cognom1=?, cognom2=?, telefon=?, tipus=?, saldo=?, cargaRestant=? WHERE uid=?';
    const values = [defaultValues.dni, defaultValues.nom, defaultValues.cognom1, defaultValues.cognom2, defaultValues.telefon, defaultValues.tipus, defaultValues.saldo, defaultValues.cargaRestant, uid];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error resetting user:', err);
            res.status(500).json('Error resetting user');
            return;
        }
        console.log('User reset successfully:', results);
        res.status(200).json('User reset successfully');
    });
});

app.post('/update-saldo', (req, res) => {
    const { uid, saldo } = req.body;

    if (!uid || saldo === undefined) {
        return res.status(400).send('User ID and saldo are required');
    }

    const updateSaldoQuery = 'UPDATE usuari SET saldo = ? WHERE uid = ?';
    const updateSaldoValues = [saldo, uid];

    connection.query(updateSaldoQuery, updateSaldoValues, (err, results) => {
        if (err) {
            console.error('Error updating saldo:', err);
            res.status(500).send('Error updating saldo');
            return;
        }

        const selectCargaQuery = 'SELECT cargaMaxima, cargaRestant FROM usuari WHERE uid = ?';
        connection.query(selectCargaQuery, [uid], (err, results) => {
            if (err) {
                console.error('Error selecting carga values:', err);
                res.status(500).send('Error selecting carga values');
                return;
            }

            if (results.length === 0) {
                return res.status(404).send('User not found');
            }

            let cargaMax = parseFloat(results[0].cargaMaxima);
            let cargaRestant = parseFloat(results[0].cargaRestant);

            // Si alguno de los valores es NaN, asignamos un valor por defecto (ej. 0)
            if (isNaN(cargaMax)) {
                console.warn(`cargaMaxima es NaN, asignando 0`);
                cargaMax = 0;
            }
            if (isNaN(cargaRestant)) {
                console.warn(`cargaRestant es NaN, asignando 0`);
                cargaRestant = 0;
            }

            const newCargaRestant = (cargaMax + cargaRestant).toFixed(2);

            const updateCargaRestantQuery = 'UPDATE usuari SET cargaRestant = ? WHERE uid = ?';
            connection.query(updateCargaRestantQuery, [newCargaRestant, uid], (err, results) => {
                if (err) {
                    console.error('Error updating cargaRestant:', err);
                    res.status(500).send('Error updating cargaRestant');
                    return;
                }
                console.log('Saldo and cargaRestant updated successfully for user ID:', uid);
                res.status(200).send('Saldo and cargaRestant updated successfully');
            });
        });
    });
});

app.get('/userData', (req, res) => {
    const query = 'SELECT dni, nom, cognom1, cognom2, telefon, tipus, saldo, cargaMaxima, cargaRestant, uid FROM usuari WHERE uid >= 1001';

    connection.query(query, (err, userData) => {
        if (err) {
            return res.status(500).send(err);
        }

        const arrayUserData = userData.map(user => ({
            user_dni: user.dni,
            user_nom: user.nom,
            user_cog1: user.cognom1,
            user_cog2: user.cognom2,
            user_tel: user.telefon,
            user_tipus: user.tipus,
            user_saldo: user.saldo,
            user_cargaMax: user.cargaMaxima,
            user_cargaRes: user.cargaRestant,
            user_uid: user.uid
        }));

        res.json(arrayUserData);
    });
});

function hashPassword(password) {
    return crypto.createHash('sha256').update(password, 'utf8').digest('hex');
}

app.post('/login', (req, res) => {
    const { usuari, contrasenya } = req.body;

    console.log("Datos recibidos:", req.body);

    if (!usuari || !contrasenya) {
        console.error("Faltan datos");
        return res.status(400).json({ message: 'Faltan datos' });
    }

    // Hashear la contraseña recibida
    const hashedPassword = hashPassword(contrasenya);
    console.log("Contraseña hasheada en servidor:", hashedPassword);

    // Comparar con los datos fijos del administrador
    if (usuari !== adminUsername || hashedPassword !== adminHashedPassword) {
        console.warn("Credenciales incorrectas");
        return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Login exitoso
    res.json({ message: 'Login exitoso', user: { nombre: adminUsername } });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}!`);
});

////////////////////////////////////////// PRUEBAS ////////////////////////////////////////////

// Función para imprimir los valores actuales en consola
const logCurrentValues = async () => {
    try {
        const power = await fetchData(powerUrl);
        const NFCID = await fetchData(NFCIDUrl);
        const vehicleConnected = await fetchData(vehicleConnectedUrl);

        console.log('--- Current Values ---');
        console.log(`Power: ${power}`);
        console.log(`NFCID: ${NFCID}`);
        console.log(`Vehicle Connected: ${vehicleConnected}`);
        console.log('-----------------------');
    } catch (error) {
        console.error('Error logging current values:', error.message);
    }
};

// Configurar un intervalo de 20 segundos para imprimir los valores
setInterval(logCurrentValues, 20000);
