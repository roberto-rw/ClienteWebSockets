const comboBoxClientes = document.querySelector('#combo')
const msjBienvenida = document.querySelector('#bienvenida')
const txtNombre = document.querySelector('#nombre')
const txtEmail = document.querySelector('#email')
const txtEdad = document.querySelector('#edad')
const txtMensaje = document.querySelector('#txtMsj')

// Obtener la cadena de consulta de la URL actual
const queryString = window.location.search;
// Crear un objeto URLSearchParams a partir de la cadena de consulta
const urlParams = new URLSearchParams(queryString);
// Obtener el valor del parámetro "usuario"
const usuario = urlParams.get('usuario');
console.log(usuario)

var wsUri = `ws://localhost:8080/EjemploWS/websocketendpoint/${usuario}`;
var output
var websocket = null

window.onload = function() {
    output = document.getElementById("output");
    websocket = new WebSocket(wsUri)
    msjBienvenida.textContent = usuario

    websocket.onopen = evt => { 
        writeToScreen("CONNECTED");

        const datos = {
            alcance: 'TODOS',
            tipo: 'conexion',
            datos: `(${usuario}): CONECTADO`
        }
        const datosJSON = JSON.stringify(datos);
        websocket.send(datosJSON)
    }

    websocket.onclose = evt => {
        writeToScreen("DISCONNECTED");
    }        

    websocket.onmessage = evt => {
        var mensaje = JSON.parse(evt.data);
        var tipoMensaje = mensaje.tipo;
        var datosMensaje = mensaje.datos;

        if (tipoMensaje == "listaUsuarios") {
            actualizarComboBox(datosMensaje)
        }else if(tipoMensaje == "mensaje"){
            writeToScreen('<span style="color: blue;">' + datosMensaje+'</span>');
        }else if(tipoMensaje == "contacto"){
            //TODO: pintar la tabla en el html
            console.log(datosMensaje)
        }
    }
                    
    websocket.onerror = evt => { 
        writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
    }
}
              
function enviarMensaje(){
    var txt = txtMensaje.value
    writeToScreen("SENT: " + txt);

    if(comboBoxClientes.value == "TODOS"){
        // console.log("TODOS ALB")
        const datos = {
            alcance: 'TODOS',
            tipo: 'mensaje',
            datos: `(${usuario}): ${txt}`
        }
        const datosJSON = JSON.stringify(datos);
        websocket.send(datosJSON)
    }else{
        const datos = {
            alcance: comboBoxClientes.value,
            tipo: 'mensaje',
            datos: `(${usuario}): ${txt}`
        }
        const datosJSON = JSON.stringify(datos);
        websocket.send(datosJSON)
    }
}

function enviarContacto(){
    const contacto = {
        nombre: txtNombre.value,
        email: txtEmail.value,
        edad: txtEdad.value
    }
    const contactoJSON = JSON.stringify(contacto)

    if(comboBoxClientes.value == "TODOS"){
        const datos = {
            alcance: 'TODOS',
            tipo: 'contacto',
            datos: contactoJSON
        }
        const datosJSON = JSON.stringify(datos);
        websocket.send(datosJSON)
    }else{
        const datos = {
            alcance: comboBoxClientes.value,
            tipo: 'contacto',
            datos: contactoJSON
        }
        const datosJSON = JSON.stringify(datos);
        websocket.send(datosJSON)
    }
}

function writeToScreen(message){
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    output.appendChild(pre);
}

function actualizarComboBox(mapaUsuarios) {
    limpiarComboBox()
    mapaUsuarios.forEach((usuario) => {
        let nuevoCliente = document.createElement('option');
        nuevoCliente.value = usuario.id;
        nuevoCliente.text = usuario.usuario;
        comboBoxClientes.add(nuevoCliente);
      });
}

function limpiarComboBox(){
    comboBoxClientes.innerHTML = ""; // Elimina todas las opciones del select
    const option = document.createElement("option");
    option.value = "TODOS";
    option.text = "TODOS";
    comboBoxClientes.appendChild(option); // Agrega la opción "TODOS" al select
}

