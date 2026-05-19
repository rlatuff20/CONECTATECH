const express = require('express');
const cors = require('cors');
const path = require('path');
app.use(express.static(path.join(__dirname)));

app.use(cors());
app.use(express.json()); 
app.use(express.static('.'));

// Tu inventario de productos (incluyendo el iPhone que agregamos)
const inventario = [
    { id: 1, name: 'New Era New York Yankees', category: 'New Era', price: 55.00, img: 'yanke.webp',stock: 3,features: ['calidad original', 'lo mejor del mercado', 'ajustable', 'mejor precio'] },
    { id: 2, name: 'New Era LA Dodgers', category: 'New Era', price: 50.00, img: 'LA.avif',stock: 2,features: ['8GB de Memoria RAM', 'Disco Duro 256GB SSD', 'Windows 11 Original'] },
    { id: 3, name: 'New Era Chicago Cubs', category: 'New Era', price: 56.90, img: 'chicago.jpg',stock: 4,features: ['8GB de Memoria RAM', 'Disco Duro 256GB SSD', 'Windows 11 Original'] },
    { id: 4, name: 'Arreglo Lirio decorado', category: 'Flores', price: 35.00, img: 'arreglos1.jpeg',stock: 0,features: ['8GB de Memoria RAM', 'Disco Duro 256GB SSD', 'Windows 11 Original'] },
    { id: 5, name: 'Bouquet mix 3 gerberas + 3 rosas', category: 'Flores', price: 55.00, img: 'arreglos2.jpeg',stock: 1,features: ['8GB de Memoria RAM', 'Disco Duro 256GB SSD', 'Windows 11 Original'] },
    { id: 6, name: 'Box de corazon 24 rosas + 3 chocolates', category: 'Flores', price: 100.00, img: 'arreglos3.jpeg',stock: 1,features: ['8GB de Memoria RAM', 'Disco Duro 256GB SSD', 'Windows 11 Original'] },
    { id: 7, name: 'Rosa premium decorada', category: 'Flores', price: 45.50, img: 'arreglos4.jpeg',stock: 3,features: ['8GB de Memoria RAM', 'Disco Duro 256GB SSD', 'Windows 11 Original'] },
    { id: 8, name: 'iPhone 15 Pro Max', category: 'iphones', price: 1100.00, img: 'iphone15.webp',stock: 2,features: ['8GB de Memoria RAM', 'Disco Duro 256GB SSD', 'Windows 11 Original'] }
];

// =======================================================
// NUEVA JUGADA: ARREGLO DE USUARIOS ADMINISTRADORES AUTORIZADOS
// =======================================================
const usuariosAdministradores = [
    { usuario: "admin", password: "udo2026" },      // Cuenta principal de la UDO
    { usuario: "ronald", password: "candy" }  // ¡Segunda cuenta para tu socio!
];

// El "token" estático para simular la sesión segura
const TOKEN_SECRETO = "credencial-secreta-caps-store-2026";

// 1. Ruta GET: Para que los clientes vean la vitrina (Pública)
app.get('/productos', (req, res) => {
    res.json(inventario);
});

// 2. RUTA MODIFICADA - POST /login: Ahora busca en la lista de usuarios
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;

    // .find() recorre el arreglo buscando coincidencia exacta de usuario Y contraseña
    const usuarioValido = usuariosAdministradores.find(u => u.usuario === usuario && u.password === password);

    if (usuarioValido) {
        console.log(`¡Inicio de sesión exitoso para el usuario: ${usuario}!`);
        res.json({ exito: true, token: TOKEN_SECRETO, mensaje: "Acceso concedido" });
    } else {
        console.log(`Intento de acceso denegado para el usuario: ${usuario}`);
        res.status(401).json({ exito: false, mensaje: "Usuario o contraseña incorrectos" });
    }
});

// 3. Ruta POST /productos: Protegida
app.post('/productos', (req, res) => {
    const tokenCliente = req.headers['authorization'];

    if (!tokenCliente || tokenCliente !== TOKEN_SECRETO) {
        return res.status(403).json({ mensaje: "Falta técnica: No autorizado." });
    }

    // Recibimos los datos nuevos
    const { name, category, price, img, stock, features } = req.body;

    const nuevoProducto = {
        id: inventario.length + 1,
        name,
        category,
        price: parseFloat(price),
        img,
        stock: parseInt(stock),
        features: Array.isArray(features) ? features : [features]
    };
    
    inventario.push(nuevoProducto);
    console.log("¡Producto guardado exitosamente!", nuevoProducto);
    
    res.json({ mensaje: "Producto guardado con éxito", producto: nuevoProducto });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('Servidor de Caps-store abierto en la red local');
});
