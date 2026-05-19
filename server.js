const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose'); // 1. Importamos mongoose
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// 2. Conexión a MongoDB (usando la variable que configuramos en Render)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('¡Conectado a MongoDB Atlas!'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// 3. Definimos el esquema del producto
const productoSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    img: String,
    stock: Number,
    features: [String]
});
const Producto = mongoose.model('Producto', productoSchema);

// TUS CREDENCIALES DE ACCESO
const usuariosAdministradores = [
    { usuario: "admin", password: "udo2026" },
    { usuario: "ronald", password: "candy" }
];

const TOKEN_SECRETO = "credencial-secreta-caps-store-2026";

// Inventario (Recuerda que si ya pasaste a MongoDB, esto es solo temporal)
const inventario = []; 

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
app.get('/productos', async (req, res) => {
    try {
        const productos = await Producto.find(); // Busca en la base de datos
        res.json(productos);
    } catch (err) {
        res.status(500).json({ mensaje: "Error al leer la base de datos" });
    }
});

app.post('/productos', async (req, res) => {
    const tokenCliente = req.headers['authorization'];
    if (tokenCliente !== TOKEN_SECRETO) return res.status(403).json({ mensaje: "No autorizado." });

    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save(); // ¡Esto guarda en la nube para siempre!
    res.json({ mensaje: "Producto guardado permanentemente en MongoDB", producto: nuevoProducto });
});

// ... mantén aquí tu ruta POST /login igual ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
