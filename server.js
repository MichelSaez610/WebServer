const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');

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

const authString = Buffer.from('admin:15j792kh').toString('base64'); // Encode the username and password

const powerUrl = 'http://192.168.1.31/jdev/sps/io/1d1eadcb-01b4-f7e8-ffffba0581a3709c/state';
const NFCIDUrl = 'http://192.168.1.31/jdev/sps/io/1d3505f3-039e-8cbf-ffffba0581a3709c/state';
const vehicleConnectedUrl = 'http://192.168.1.31/jdev/sps/io/1d3e0a78-00be-871b-ffffba0581a3709c/state';
const lastChargeUrl = 'http://192.168.1.31/jdev/sps/io/1d420173-00b0-402e-ffffba0581a3709c/state';

let currentPower = null;
let currentNFCID = null;
let connectedValue = null;
let lastConnectedValue = null;

let finaluid = null
let finalname = null
let finalfSurname = null
let finalsSurname = null
let finaldni = null
let finaltype = null
let finalsaldo = null
let finaltel = null

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
    currentPower = await fetchData(powerUrl);
    currentNFCID = await fetchData(NFCIDUrl);
    connectedValue = await fetchData(vehicleConnectedUrl);
    lastCharge = await fetchData(lastChargeUrl);

    if (connectedValue == 1) {
        // console.log('Vehicle Connectat')
    } else {
        // console.log('Vehicle Desconnectat');

        if (lastConnectedValue == 1) {
            updateSaldoRestant(lastCharge, currentNFCID);
            lastCharge = 0
        }
    }

    lastConnectedValue = connectedValue;
};

// Actualiza los valores cada 5 segundos
setInterval(updateValues, 5000);


function updateUser(uid, name, fSurname, sSurname, dni, saldo, type, tel) {
    const query = 'UPDATE usuari SET dni=?, nom=?, cognom1=?, cognom2=?, telefon=?, tipus=?, saldo=? WHERE uid=?'
    const values = [dni, name, fSurname, sSurname, tel, type, saldo, uid]

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating user: ', err)
            return;
        }
        console.log('User updated successfully: ', results);
    });
};

function updateSaldoRestant(lastCharge, id) {
    let cargaOldRest = null
    let cargaNewRest = null
    const selectQuery = 'SELECT cargaRestant FROM usuari WHERE id=?'
    const updateQuery = 'UPDATE usuari SET cargaRestant=? WHERE uid=?'
    
    connection.query(selectQuery, id + 1, (err, results) => {
        if (err) {
            console.log('Error: ', err);
            return;
        }
        cargaOldRest = results.cargaRestant
    })

    cargaNewRest = cargaOldRest - lastCharge

    connection.query(updateQuery, [cargaNewRest, id + 1], (err,results) => {
        if (err) {
            console.error('Error updating user: ', err)
            return;
        }
        console.log('User updated successfully: ', results);
    })
}


// Endpoint para obtener los valores
app.get('/api/data', (req, res) => {
    res.json({
        power: currentPower,
        NFCID: currentNFCID,
        name: finalname,
        fsurnamme: finalfSurname,
        sSurname: finalsSurname,
        dni: finaldni,
        saldo: finalsaldo,
        type: finaltype,
        tel: finaltel
    });
});


app.get('/uid', (req, res) => {
    // console.log('Request received for /uid');

    connection.query('SELECT uid FROM usuari', (error, results) => {
        if (error) {
            console.error('database query error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Format the results
        const formattedResults = {};
        results.forEach((result, index) => {
            formattedResults[`uid${index + 1}`] = result.uid;
        });

        res.json(formattedResults);
    });
    // console.log(currentPower);
    // console.log(currentNFCID);
});

app.get('/maxConsumo', (req, res) => {
    // console.log('Request recived for /maxConsumo')

    connection.query('SELECT cargaRestant FROM usuari', (error, results) => {
        if (error) {
            console.error('database query error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Format the results
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
    }

    console.log(clientData)

    finaluid = clientData.uid
    finalname = clientData.name
    finalfSurname = clientData.fSurname
    finalsSurname = clientData.sSurname
    finaldni = clientData.dni
    finalsaldo = clientData.saldo
    finaltype = clientData.type
    finaltel = clientData.tel

    updateUser(finaluid,finalname,finalfSurname,finalsSurname,finaldni,finalsaldo,finaltype,finaltel);
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
        saldo: 0.00
    };

    const query = 'UPDATE usuari SET dni=?, nom=?, cognom1=?, cognom2=?, telefon=?, tipus=?, saldo=? WHERE uid=?';
    const values = [defaultValues.dni, defaultValues.nom, defaultValues.cognom1, defaultValues.cognom2, defaultValues.telefon, defaultValues.tipus, defaultValues.saldo, uid];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error resetting user:', err);
            res.status(500).send('Error resetting user');
            return;
        }
        console.log('User reset successfully:', results);
        res.status(200).send('User reset successfully');
    });
});

app.post('/update-saldo', (req, res) => {
    const { uid, saldo } = req.body;

    // Ensure that uid and saldo are valid
    if (!uid || saldo === undefined) {
        return res.status(400).send('User ID and saldo are required');
    }

    // SQL query to update the saldo for the specified user
    const query = 'UPDATE usuari SET saldo = ? WHERE uid = ?';
    const values = [saldo, uid];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating saldo:', err);
            res.status(500).send('Error updating saldo');
            return;
        }

        // Check if any rows were affected
        if (results.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        console.log('Saldo updated successfully for user ID:', uid);
        res.status(200).send('Saldo updated successfully');
    });
});

app.get('/userData', (req, res) => {
    
    const query = 'SELECT dni, nom, cognom1, cognom2, telefon, tipus, saldo, cargaMaxima, cargaRestant, uid FROM usuari WHERE uid >= 1001'

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

        res.json(arrayUserData)
    })

});


app.listen(port, () => {
    console.log(`Server listening on port ${port}!`);
});

