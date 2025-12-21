(function () {
    // 1. Disable Right Click context menu
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // 2. Disable Inspection Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    document.addEventListener('keydown', function (e) {
        // F12
        if (e.keyCode == 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (Inspect) or Ctrl+Shift+J (Console) or Ctrl+Shift+C (Element)
        if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode == 85) {
            e.preventDefault();
            return false;
        }
    });

    // 3. Console Warning for smart users who open devtools anyway
    const warningTitle = "ATENÇÃO!";
    const warningMsg = "Este é um recurso de navegador voltado para desenvolvedores. Se alguém lhe disse para copiar e colar algo aqui para ativar um recurso ou 'hackear' a conta de alguém, trata-se de uma fraude e você dará acesso à sua conta.";

    console.log(`%c${warningTitle}`, "color: red; font-size: 40px; font-weight: bold; text-shadow: 1px 1px 5px black;");
    console.log(`%c${warningMsg}`, "font-size: 16px;");

    // 4. Debugger Trap (Annoying for anyone trying to step through code)
    // Uncommenting this makes debugging very hard but might impact performance slightly if devtools is open
    /*
    setInterval(function(){
        debugger;
    }, 1000);
    */

})();
