(function () {
  const params = new URLSearchParams(window.location.search);

  // ----------------------------
  // Helpers
  // ----------------------------
  function getParam(name) {
    const v = params.get(name);
    return v ? decodeURIComponent(v) : "";
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value || "";
  }

  function hideById(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  }

  function hideBySelector(sel) {
    const el = document.querySelector(sel);
    if (el) el.style.display = "none";
  }

  function formatPhoneHN(texto) {
    // Formato: 99 89-97 41 (si son 8 dígitos)
    const soloDigitos = (texto || "").replace(/\D/g, "");
    if (soloDigitos.length === 8) {
      return `${soloDigitos.slice(0,2)} ${soloDigitos.slice(2,4)}-${soloDigitos.slice(4,6)} ${soloDigitos.slice(6)}`;
    }
    return texto || "";
  }

  function setTelefonoConIcono(id, telRaw) {
    const el = document.getElementById(id);
    if (!el) return;

    const tel = formatPhoneHN(telRaw);

    // Icono ✆ negro grande
    const icono = document.createElement("span");
    icono.innerHTML = "&#9990;&nbsp;";
    icono.style.fontSize = "25px";
    icono.style.color = "#000";
    icono.style.marginRight = "3px";

    el.textContent = "";
    el.appendChild(icono);
    el.appendChild(document.createTextNode(tel));
  }

  function setCostoFormateado(id, valorRaw) {
    const el = document.getElementById(id);
    if (!el) return;

    const num = parseFloat((valorRaw || "").toString().replace(",", "."));
    if (!isNaN(num)) el.textContent = num.toFixed(2);
    else el.textContent = valorRaw || "";
  }

  function getTextoConformePorEstado(estado) {
    // IMPORTANTE: aquí va la lógica que antes estaba en AppSheet
    if ((estado || "").trim() === "D-ENTREGADO") {
      return "El cliente o representante declara que ha recibido el equipo en perfectas condiciones y que ha sido probado y verificado su correcto funcionamiento al momento de la entrega. La empresa no se hace responsable por daños ocasionados durante el transporte posterior a la entrega. El cliente asume la responsabilidad de cualquier daño posterior y entiende que no se realizarán ajustes adicionales por problemas derivados de un manejo inadecuado del equipo. Este servicio de reparación cuenta con una garantía de 7 días, excluyendo daños causados por mal uso, caídas, líquidos, problemas eléctricos, daños causados por plagas, manipulaciones de cualquier tipo o transporte inadecuado.";
    }

    return (
      "CONDICIONES\n" +
      "1. Todo equipo deberá ser RECLAMADO en un plazo no mayor de 90 DÍAS, a partir de la fecha de ingreso al taller, caso contrario será rematado para cubrir COSTOS DE REPARACIÓN y ALMACENAJE.\n" +
      "2. A partir de los 15 días desde la fecha se generará un cargo por ALMACENAJE con un valor de CINCO Lempiras (L5,00) por día, el cual deberá ser abonado por el propietario juntamente con el retiro del equipo mencionado en este documento.\n" +
      "3. En caso de solo hacerse DIAGNÓSTICO se cobrará L150.00 (ciento cincuenta Lempiras), CUANDO SEAN COMPUTADORAS, y L200.00 (doscientos Lempiras) en el caso de las IMPRESORAS.\n" +
      "4. AL MOMENTO DE RECLAMAR EL EQUIPO ES OBLIGATORIO PRESENTAR ESTE RECIBO, CASO CONTRARIO NO SE ENTREGARÁ EL EQUIPO. Se da por entendido que el portador de este RECIBO está autorizado a RECLAMAR LA ENTREGA del equipo.\n" +
      "\n" +
      "Conforme.\n" +
      "Es entendido que al dejar el equipo para su DIAGNÓSTICO o REPARACIÓN y tomar el RECIBO, ACEPTA las CONDICIONES arriba descritas en este DOCUMENTO."
    );
  }

  function setTextoConSaltos(id, texto) {
    const el = document.getElementById(id);
    if (!el) return;

    // Para conservar saltos de línea dentro del <p>
    // Usamos textContent y forzamos white-space desde JS para no tocar tu CSS
    el.style.whiteSpace = "pre-line";
    el.textContent = texto || "";
  }

  // ----------------------------
  // Cargar campos desde URL (SIN TEXTOCONFORME)
  // ----------------------------
  const fields = [
    "FECHA_RECEPCION",
    "IDTALLERPC",
    "IDxORDENPC",
    "NOMBRECLIENTE",
    "TELCLIENTE",
    "DIRCLIENTE",
    "RECIBIDO_POR",
    "EQUIPOX",
    "MARCA",
    "INFO1",
    "INFO2",
    "SERVICIOREQUERIDO",
    "SERVICIOREALIZADO",
    "ESTADO",
    "COSTOLPS",
    "CONFORME",
    "_qr",
    "CLAVE",
    "GARANTIA"
  ];

  fields.forEach((c) => {
    const valor = getParam(c);
    if (!valor) return;

    if (c === "_qr") {
      const el = document.getElementById("_qr");
      if (el) {
        el.src = valor;
        el.alt = "QR del equipo";
        el.style.display = "block";
      }
      return;
    }

    if (c === "TELCLIENTE") {
      setTelefonoConIcono("TELCLIENTE", valor);
      return;
    }

    if (c === "COSTOLPS") {
      setCostoFormateado("COSTOLPS", valor);
      return;
    }

    setText(c, valor);
  });

  // ----------------------------
  // TEXTOCONFORME generado localmente (ya no viaja por URL)
  // ----------------------------
  const estado = getParam("ESTADO");
  const textoConforme = getTextoConformePorEstado(estado);
  setTextoConSaltos("TEXTOCONFORME", textoConforme);

  // ----------------------------
  // Firma (CONFORME) solo si existe
  // ----------------------------
  const firmaParam = getParam("CONFORME");
  const imgFirma = document.getElementById("CONFORME_IMG");
  if (imgFirma) {
    if (firmaParam && firmaParam.trim() !== "") {
      let firmaURL = firmaParam;

      // Si la URL es una ruta interna de AppSheet, convertirla a URL pública
      if (firmaURL.startsWith("PC_Images/") || firmaURL.startsWith("IMPRESORAS_Images/")) {
        const tabla = firmaURL.startsWith("IMPRESORAS_Images/") ? "IMPRESORAS" : "PC";
        firmaURL =
          "https://www.appsheet.com/template/gettablefileurl?" +
          "appName=TYTOneDBA-909404411" +
          "&tableName=" + tabla +
          "&fileName=" + encodeURIComponent(firmaURL);
      }

      imgFirma.src = firmaURL;
      imgFirma.style.display = "block";
    } else {
      imgFirma.style.display = "none";
    }
  }

  // ----------------------------
  // Mostrar PW y Garantía
  // ----------------------------
  const pwInfo = document.getElementById("pwInfo");
  if (pwInfo) pwInfo.style.display = "block";

  // ----------------------------
  // Modo corto
  // ----------------------------
  const modo = getParam("modo");
  if (modo === "corto") {
    // Oculta secciones grandes
    hideById("seccionConforme");
    hideBySelector(".whatsapp"); // QR WhatsApp
    // Si quieres ocultar "TRABAJO REALIZADO" completo:
    // hideById("SERVICIOREALIZADO");
  }

  // ----------------------------
  // Impresión (solo si print=1)
  // ----------------------------
  window.addEventListener("load", () => {
    const printMode = getParam("print");
    if (printMode === "1") {
      setTimeout(() => {
        try {
          const esAndroid = /Android/i.test(navigator.userAgent);
          if (esAndroid) {
            // Intentar abrir RawBT
            const rawbtIntent =
              "intent://print/#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;";
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = rawbtIntent;
            document.body.appendChild(iframe);

            // Si RawBT no responde, usar impresión normal
            setTimeout(() => window.print(), 1500);
          } else {
            window.print();
          }
        } catch (err) {
          console.error("Error al imprimir:", err);
          window.print();
        }
      }, 1000); // esperar para cargar imágenes y QR
    }
  });
})();
