class PressGameRunner {
    engine;
    ui;

    constructor(engine, ui) {
        this.engine = engine;
        this.ui = ui;
    }

    run() {
        this.ui.init();
    }
}
