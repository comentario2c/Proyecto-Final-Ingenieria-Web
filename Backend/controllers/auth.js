const dbConfig = require('../db');
const db = dbConfig;

const rol_db = {
    alumno: "alumno",
    profesor: "profesor",
}

const dominio_db = {
    alumno: "alu.unach.cl",
    profesor: "unach.cl"
}

const loginGoogle = async (req, res) => {
    const uid = req.user.uid;
    const email = req.user.email;

    // pregunto si existe un nombre en el json de vue o en la base de datos, si no hay ninguno "Usuario"
    const displayName = req.user.name || req.body.displayName || 'Usuario';

    // Si no viene el uid o el email retornamos 400
    if (!uid || !email) return res.status(400).json({ error: 'Faltan datos' });

    try {
        // Buscamos al usuario en la base de datos
        const [rows] = await db.query('SELECT * FROM Usuario WHERE ID_Usuario = ?', [uid]);

        // Si existe el usuario
        if (rows.length > 0) {
            const usuario = rows[0];

            // Comprobamos el borrado logico
            if (usuario.estado === 0) {
                return res.status(403).json({ error: 'Cuenta desactivada. Contacte al administrador.' });
            }

            // Usuario registrado pero sin rut
            if (!usuario.rut) {
                return res.status(200).json({
                    esNuevo: true, // Obligamos al usuario a registrarse 
                    usuario: {
                        uid: usuario.ID_Usuario,
                        nombre: usuario.nombre,
                        email: usuario.correo,
                        rol: usuario.rol
                    }
                });
            }

            // Usuario ya registrado y con rut completo
            return res.status(200).json({
                esNuevo: false,
                usuario: {
                    uid: usuario.ID_Usuario,
                    nombre: usuario.nombre,
                    email: usuario.correo,
                    rol: usuario.rol,
                    rut: usuario.rut
                }
            });

        } else {
            // Cuando el usuario es nuevo
            const dominio = email.split('@')[1];
            let rolInicial = '';

            // A través del correo deducimos si es un alumno o profesor
            if (dominio === dominio_db.alumno) rolInicial = rol_db.alumno; // Evitamos magicstrings con el diccionario
            else if (dominio === dominio_db.profesor) rolInicial = rol_db.profesor;
            else return res.status(403).json({ error: 'Dominio no autorizado.' });

            // Insertamos el nuevo usuario
            await db.query(
                'INSERT INTO Usuario (ID_Usuario, nombre, correo, rol, rut, estado) VALUES (?, ?, ?, ?, ?, ?)',
                [uid, displayName, email, rolInicial, null, 1] 
            );

            // Devolvemos el rol y el nombre, el nombre para la vista de alumnos por lo menos y el rol para la redireccion
            return res.status(201).json({
                esNuevo: true,
                usuario: {
                    uid,
                    nombre: displayName,
                    email,
                    rol: rolInicial
                }
            });
        }

    } catch (error) {
        console.error('Error en loginController:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const completarPerfil = async (req, res) => {
    const { rut } = req.body;
    const uid = req.user.uid;

    if (!rut) {
        return res.status(400).json({ error: 'El RUT es obligatorio' });
    }
    
    // Quitamos los . y - para evitar el too long (varchar(9))
    const rutLimpio = rut.replace(/[\.\-]/g, '');

    if (rutLimpio.length > 9) {
        return res.status(400).json({ error: 'RUT demasiado largo' });
    }

    try {
        // Se actualiza el usuario agregando el rut
        const [result] = await db.query(
            'UPDATE Usuario SET rut = ? WHERE ID_Usuario = ?',
            [rutLimpio, uid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Perfil completado exitosamente' });

    } catch (error) {
        console.error('Error en completarPerfil:', error);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
};

module.exports = { loginGoogle, completarPerfil };