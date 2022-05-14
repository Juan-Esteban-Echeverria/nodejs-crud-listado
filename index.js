const url = require('url')
const http = require('http')
const fs = require('fs')

const server = http.createServer(function (req, res) {

    let {deportes} = JSON.parse(fs.readFileSync('data.json'))

    // LEER EL HTML
    if (req.url == '/') {
      res.setHeader('content-type', 'text/html')
      fs.readFile('index.html', 'utf8', (err, data) => {
        res.end(data)
      })
    }

    // RUTA GET PARA IMPRIMIR TODOS LOS DEPORTES
    if (req.url.includes('/deportes') && req.method === "GET") {
      fs.readFile('data.json', 'utf8', (err, data) => {
        res.end(data)
      })
    }

    // RUTA POST PARA LA PERSISTENCIA DE LOS DEPORTES EN JSON
    if (req.url.startsWith('/agregar') && req.method === "POST") {
      fs.readFile('data.json', 'utf8', (err, data) => {
        let payload = ''
        req.on("data", (body) => {
          payload += body
        })
  
        req.on("end", ()=> {
          const {nombre, precio} = JSON.parse(payload)

          if(nombre === "" || precio ==="")
          return res.end("Los valores no pueden estar en blanco")

          let deportes = JSON.parse(data).deportes
          deportes.push({
            nombre,
            precio,
          })

          fs.writeFile('data.json', JSON.stringify( {deportes} ), (err, data) => {
            err ? console.log(' oh oh...') : console.log(' OK ')
            res.end('Deporte agregado con exito')
          })
        })
      })
    }

    // RUTA PUT PARA LA ACTUALIZACION DE LOS PRECIOS
    if (req.url.startsWith('/editar') && req.method === "PUT") {
      let respuesta = ''
      req.on("data", (body) => {
        respuesta += body
      })

      req.on('end', () => {
        const deporte = JSON.parse(respuesta)

        if(deporte.nombre === "" || deporte.precio ==="")
        return res.end("El precio no puede estar en blanco")

        deportes = deportes.map(d => {
          if(d.nombre === deporte.nombre){
            d = deporte
          }
          return d
        })
        fs.writeFile("data.json", JSON.stringify({deportes: deportes}), (err) => {
          res.writeHead(200, {"Content-Type": "application/json"})
          res.end('Deporte editado con exito')
        })
      })
    }

    // RUTA DELETE PARA ELIMINAR UN DEPORTE
    if (req.url.startsWith('/eliminar') && req.method === "DELETE") {
      const { nombre } = url.parse(req.url, true).query
      fs.readFile('data.json', 'utf8', (err, data) => {
        let deportes = JSON.parse(data).deportes
        deportes = deportes.filter((d) => d.nombre !== nombre)
        fs.writeFile('data.json', JSON.stringify({ deportes }), (err, data) => {
          err ? console.log(' oh oh...') : console.log(' OK ')
          res.end('Deporte elimado con exito')
        })
      })
    }
  })
  .listen(3000, () => console.log("Server on"))

  module.exports = server;
