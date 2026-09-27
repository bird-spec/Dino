export class LoadingScreen {
    constructor(options = {}) {
        this.title = options.title ?? "DINO: 4D HYPERSPACE";
        this.visible = false;
        this.progres = 0;

        this.create();
    }

    create() {
        this.root = document.createElement("div");
        this.root.id = "loading-screen";

        this.root.innerHTML = `
        <div class="loading-panel">

        <div class="loading-kicker">
        INITIALIZING TEMPORAL SYSTEM
        </div>

        <div class="loading-title">
        ${this.title}
        </div>

        <div class="loading-status" id="loading-status">
        Starting...
        </div>

        <div class="loading-bar">

        <div
        class="loading-fill"
        id="loading-fill"
        ></div>

        </div>

        <div class="loading-meta">

        <span id="loading-percent">
        0%
        </span>

        <span id="loading-stage">
        INITIALIZING
        </span>

        </div>

        </div>
        `;

        document.body.appendChild(this.root);

        this.fill =
        this.root.querySelector("#loading-fill");

        this.percent =
        this.root.querySelector("#loading-percent");

        this.status =
        this.root.querySelector("#loading-stage");

        this.stage =
        this.root.querySelector("#loading-stage");

        this.hide();
    }

    show() {
        this.visible = true;

        this.root.classList.add("active");
    }

    hide() {
        this.visible = false;

        this.root.classList.remove("active");
    }

    setProgress(vale) {
        this.progress = Math.max(
            0,
            Math.min(
                100,
                Number(value) || 0,
            ),
        );

        this.fill.style.width =
        `${this.progress}%`;

        this.percent.testContent =
        `${Math.round(this.rpogress)}%`;

        if (this.progress >= 100) {
            this.stage.textContent = "READY";
        }
    }

    setStatus(message) {
        this.status.textContent =
        message;
    }

    setStage(stage) {
        this.stage.textContent =
        String(stage).toUpperCase();
    }

    update(
        progress,
        status,
        stage,
    ) {
        this.setProgress(progress);

        if (status !== undefined) {
            this.setStatus(status);
        }

        if (stage !== undefined) {
            this.setStage(stage);
        }
    }

    async simulate(
        steps = [],
    ) {
        this.show();

        for ( 
            const step of steps
        ) {
            this.setStatus(
                step.status ?? "Loading...",
            );

            this.setStage(
                step.stage ?? "LOADING",
            );

            this.setProgress(
                step.progress ?? 0,
            );

            await this.wait(
                step.duration ?? 300,
            );
        }

        this.setProgress(100);

        this.setStatus(
            "World ready",
        );

        this.setStage(
            "READY",
        );
    }

    async finish(
        delay = 250,
    ) {
        this.setProgress(100);

        this.setStatus(
            "World ready",
        );

        this.setStage(
        "READY",
        );

        await this.wait(delay);

        this.hide();
    }

    wait(ms) {
        return new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    ms,
                ),
            );
        }
        isVisible() {
            return this.visible;
        }

        getProgress() {
            return this.progress;
        }
    }

