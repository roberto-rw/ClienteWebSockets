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
            writeToScreen('<span>' + datosMensaje+'</span>');
        }else if(tipoMensaje == "contacto"){
            llenarTablaContactos(datosMensaje);
            console.log(datosMensaje);
        }
    }
                    
    websocket.onerror = evt => { 
        writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
    }
}
              
function enviarMensaje(){
    var txt = txtMensaje.value
    writeToScreen("Tu: " + txt);

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
    pre.classList.add("mensaje")
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

function llenarTablaContactos(contacto){
    const {nombre, email, edad} = contacto;

    const formulario = document.querySelector("#form")

    if(document.querySelector(".dato-edad")){
        document.querySelector(".dato-nombre").textContent = nombre;
        document.querySelector(".dato-email").textContent = email;
        document.querySelector(".dato-edad").textContent = edad;
        return;
    }

    const tablaContacto = document.createElement("table");
    tablaContacto.classList.add("tabla-contacto");
    const tablaHeader = document.createElement("thead")
    const tablaHeaderRow = document.createElement("tr");
    const dataHeader1 = document.createElement("th");
    const dataHeader2 = document.createElement("th");
    const dataHeader3 = document.createElement("th");
    dataHeader1.textContent = "Nombre";
    dataHeader2.textContent = "Email";
    dataHeader3.textContent = "Edad";
    tablaHeaderRow.appendChild(dataHeader1);
    tablaHeaderRow.appendChild(dataHeader2);
    tablaHeaderRow.appendChild(dataHeader3);
    tablaHeader.appendChild(tablaHeaderRow);

    const tablaBody = document.createElement("tbody");
    const tablaBodyRow = document.createElement("tr");
    const dataBody1 = document.createElement("td");
    const dataBody2 = document.createElement("td");
    const dataBody3 = document.createElement("td");

    dataBody1.classList.add("dato-nombre");
    dataBody2.classList.add("dato-email");
    dataBody3.classList.add("dato-edad");
    dataBody1.textContent = nombre;
    dataBody2.textContent = email;
    dataBody3.textContent = edad;
    tablaBodyRow.appendChild(dataBody1);
    tablaBodyRow.appendChild(dataBody2);
    tablaBodyRow.appendChild(dataBody3);
    tablaBody.appendChild(tablaBodyRow);

    tablaContacto.appendChild(tablaHeader);
    tablaContacto.appendChild(tablaBody);
    formulario.parentNode.insertBefore(tablaContacto, formulario.nextSibling);

}