const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// 1. Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('¡Conectado a MongoDB Atlas!'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// 2. Definimos el esquema del producto
const productoSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    img: String,
    stock: Number,
    features: [String]
});
const Producto = mongoose.model('Producto', productoSchema);

// 3. NUEVO: Definimos el esquema del Historial (Logs)
const historialSchema = new mongoose.Schema({
    accion: { type: String, required: true },
    detalles: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
});
const Historial = mongoose.model('Historial', historialSchema);

// TUS CREDENCIALES DE ACCESO
const usuariosAdministradores = [
    { usuario: "admin", password: "udo2026" },
    { usuario: "ronald", password: "candy" }
];

const TOKEN_SECRETO = "credencial-secreta-caps-store-2026";

// RUTA DE LOGIN
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    const usuarioValido = usuariosAdministradores.find(u => u.usuario === usuario && u.password === password);

    if (usuarioValido) {
        res.json({ exito: true, token: TOKEN_SECRETO, mensaje: "Acceso concedido" });
    } else {
        res.status(401).json({ exito: false, mensaje: "Usuario o contraseña incorrectos" });
    }
});

// 4. RUTAS USANDO MONGODB

// Leer productos
app.get('/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ mensaje: "Error al leer la base de datos" });
    }
});

// Crear producto
app.post('/productos', async (req, res) => {
    try {
        const tokenCliente = req.headers['authorization'];
        if (tokenCliente !== TOKEN_SECRETO) return res.status(403).json({ mensaje: "No autorizado." });

        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();

        // REGISTRO DE CAMBIOS: Guardamos que se creó un producto
        const nuevoLog = new Historial({
            accion: "CREAR",
            detalles: `Se agregó el producto: ${nuevoProducto.name}`
        });
        await nuevoLog.save();

        res.json({ mensaje: "Producto guardado permanentemente en MongoDB", producto: nuevoProducto });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al guardar el producto", error });
    }
});

// Eliminar producto
app.delete('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.headers['authorization'];
        
        // Mejorada la seguridad para que exija el token correcto
        if (token !== TOKEN_SECRETO) {
            return res.status(401).json({ mensaje: "No autorizado" });
        }

        const productoEliminado = await Producto.findByIdAndDelete(id);
        
        if (!productoEliminado) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }

        // REGISTRO DE CAMBIOS: Guardamos que se eliminó un producto
        const nuevoLog = new Historial({
            accion: "ELIMINAR",
            detalles: `Se eliminó el producto: ${productoEliminado.name}`
        });
        await nuevoLog.save();

        res.json({ mensaje: "Producto eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el producto", error });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
