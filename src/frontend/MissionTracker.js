export class MissionTracker {
    constructor(options = {}) {
        this.options = {
            maxVisibleMissions: options.maxVisibleMissions ?? 5,
            showCompleted: options.showCompleted ?? true,
            ...options,
        };

        this.missions = new Map();
        this.activeMissionId = null;

        this.root = null;
        this.list = null;
        this.activeTitle = null;
        this.activeDescription = null;
        this.activeProgress = null;
        this.activeProgressFill = null;

        this.createUI();
        this.bindEvents();
    }

    //create UI

    createUI() {
        this.root = document.createElement("section");

        this.root.id = "mission-tracker";

        this.root.innerHTML = `
        <div class="mission-tracker-panel">

        <div class="mission-tracker-header">

        <div>
        <div clsss="mission-label">
        MISSION LOG
        </div>

        <div
        class="mission-active-title"
        id="mission-active-title"
        >
        No Active Mission
        </div>
        </div>

        <button
        class="mission-toggle"
        id="mission-toggle"
        type="button"
        >
        LOG
        </button>
        </div>

        <div
        class="mission-active-description"
        id="mission-active-description"
        >
        Continue exploring the world
        </div>

        <div class="mission-progress-area">

        <div class="mission-progress-header">

        <span>
        PROGRESS
        </span>

        <span
        id="mission-active-progress"
        >
        0 / 0
        </span>

        </div>

        <div class="mission=progress-bar">

        <div
        class="mission-progress-fill"
        id="mission-active-progress-fill"
        ></div>

        </div>

        </div>

        <div
        class="mision-list hidden"
        id="mission-list"
        ></div>

        </div>
        `;

        document.body.appendChild(this.root);

        this.list =
        this.root.querySelector(
            "#mission-list",
        );

        this.activeTitle =
        this.root.querySelector(
            "#mission-active-title",
        );

        this.activeDescription =
        this.root.querySelector(
            "#mission-active-description",
        );

        this.activeProgress =
        this.rootquerySelector(
            "#mission-active-progress",
        );

        this.activeProgressFill =
        this.root.querySelector(
            "#mission-active-progress-fill",
        );

        this.toggleButton =
        this.root.querySelector(
            "#mission-toggle",
        );
    }

    //events

    bindEvents() {
        this.toggleButton.addEventListener(
            "click",
            () => {
                this.toggleMissionLog();
            },
        );

        window.addEventListener(
            "mission:add",
            (event) => {
                this.addMission(
                    event.detail,
                );
            },
        );

        window.addEventListener(
            "mission:remove",
            (event) => {
                this.removeMission(
                    event.detail?.id,
                );
            },
        );

        window.addEventListener(
            "missions:updateObjective",
            (event) => {
                this.updateObjective(
                    event.detail?.missionId,
                    event.detail?.objectiveId,
                    event.detail?.completed,
                );
            },
        );

        window.addEventListener(
            "missions:setActive",
            (event) => {
                this.setActiveMission(
                    event.detail?.id,
                );
            },
        );

        window.addEventListener(
            "missions:complete",
            (event) => {
                this.completeMission(
                    event.detail?.id,
                );
            },
        );
    }

    //add mission

    addMission(data = {}) {
        if (!data.id) {
            console.warn(
                "MissionTracker: mission requires an id",
            );

            return null;
        }

        const mission = {
            id: data.id,

            title:
            data.title ??
            "Unnamed Mission",

            description:
            data.description ??
            "",

            category:
            data.category ??
            "Story",

            priority:
            data.priority ??
            "normal",

            completed:
            Boolean(
                data.completed,
            ),

            objectives:
            Array.isArray(
                data.objectives,
            )
            ? data.objectives.map(
                (objective, index) =>
                    this.normalizeObjective(
                        objective,
                        index,
                    ),
                )
                : [],

            rewards:
            Array.isArray(
                data.reards,
            )
            ? [...data.rewards]
            : [],

            metadata:
            data.metadata ??
            {},
        };

        this.missions.set(
            mission.id,
            mission,
        );


        if (
            !this.activeMissionId &&
            !mission.completed
        ) {
            this.activeMissionId =
            mission.id;
        }


        this.render();

        this.emitMissionEvent(
            "missionAdded",
            mission,
        );

        return mission;
    }

    //normalize objective

    normalizeObjective(
        objective,
        index,
    ) {
        if (
            typeof objective ===
            "string"
        ) {
            return {
                id:
                `${index + 1}`,

                text:
                objective,

                completed:
                false,

                current:
                0,

                required:
                1,

                type:
                "boolean",

                metadata:
                {},
            };
        }


        return {
            id:
            objective.id ??
            `${index + 1}`,

            text:
            objective.text ??
            "Objective",

            completed:
            Boolean(
                objective.completed,
            ),

            current:
            Number(
                objective.completed,
                0,
            ),

            required:
            Math.max(
                1,
                Number(
                    objective.required ??
                    1,
                ),
            ),

            type:
            objective.type ??
            "boolean",

            metadata:
            objective.metadata ??
            {},
        };
    }

    //remove mission

    removeMission(id) {
        if (!id) {
            return false;
        } 

        const mission =
        this.missions.get(id);

        if (!mission) {
            return false;
        }

        this.missions.delete(id);

        if (
            this.activeMissionId === id
        ) {
            this.activeMissionId =
            this.findNextActiveMissionId();
        }

        this.render();

        this.emitMissionEvent(
            "missionRemoved",
            mission,
        );


        return true;
    }

    //set active mission

    setActiveMission(id) {
        if (
            id === null ||
            id === undefined
        ) {
            this.activeMissionId = null;

            this.render();

            return;
        }

        const mission =
        this.missions.get(id);


        if (!mission) {
            console.warn(
                `MissionTracker: mission "${id}" does not exist`,
            );

            return;
        }


        if (mission.completed) {
            console.warn(
                "MissionTracker: completed missions cannot become active",
            );

            return;
        }

        this.activeMissionId =
        id;

        this.render();

        this.emitMissionEvent(
            "activeMissionChnaged",
            mission,
        );
    }

    //update objective

    updateObjective(
        missionId,
        objectiveId,
        completed = true,
    ) {
        const mission =
        this.mission.get(
            missionId,
        );

        if (!mission) {
            console.warn(
                "MissionTracker: mission not found",
                missionId,
            );
            
            return false;
        }

        const objective =
        mission.objective.find(
            (item) =>
                String(item.id) ===
            String(objectiveId),
);

    
        if (!objective) {
            console.warn(
                "MissionTracker: objective not found",
                objectiveId,
            );

            return false;
        }


        objective.completed =
        Boolean(
            completed,
        );

        if (
            objective.completed &&
            objective.current <
            objective.required
        ) {
            objective.current =
            objective.required;
        }


        const missionCompleted =
        this.isMissionComplete(
            mission,
        );


        if (
            missionCompleted &&
            !mission.completed
        ) {
            this.completeMission(
                mission.id,
            );
        }


        this.render();

        this.emitMissionEvent(
            "objectiveUpdated",
            {
                mission,
                objective,
            },
        );

        return true;
    }

    //update objective progress

    setObjectiveProgress(
        missionId,
        objectiveId,
        current,
    ) {
        const mission =
        this.missions.get(
            missionId,
        );

        if (!mission) {
            return false;
        }


        const objective =
        mission.objectives.find(
            (item) =>
                String(item.id) ===
            String(objectiveId),
);


        if (!objective) {
            return false;
        }

        objective.current =
        Math.max(
            0,
            Math.min(
                Number(
                    current,
                ) || 0,
                objective.required,
            ),
        );

        if (
            objective.current >=
            objective.required
        ) {
            objective.completed =
            true;
        }


        if (
            this.isMissionComplete(
                mission,
            )
        ) {
            this.completeMission(
                missionId
            );
        }

        this.render();

        this.emitMissionEvent(
            "objectiveProgressChanged",
            {
                mission,
                objective,
            },
        );


        return true;
    }


    //complete mission                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         hi

    completeMission(id) {
    const mission =
    this.missions.get(id);


    if (!mission) {
        return false;
    }


    mission.objectives.forEach(
        (objective) => {
            objective.completed =
            true;

        objective.current =
        objective.required;
        },
    );


    mission.completed =
    true;


    if (
        this.activeMissionId === id
    ) {
        this.activeMissionId =
        this.findNextActiveMissionId();
    }

    this.render();


    this.emitMissionEvent(
        "missionCompleted",
        mission,
    );

    window.dispatchEvent(
        new CustomEvent(
            "ui:notification",
            {
                detail: {
                    message:
                    `Mission complete: ${mission.title}`,

                    type:
                    "success",
                },
            },
        ),
    );

    return true;
}

//is mission complete

isMissionComplete(
    mission,
) {
    if (
        !mission.objectives ||
        mission.objectives.length === 0
    ) {
        return false;
    }


    return mission.objectives.every(
        (objective) =>
            objective.completed ||
            objective.current >=
            objective.required,
);
}

//find next active

findNextActiveMissionId() {
    const missions =
    [...this.missions.values()]
    .filter(
        (mission) =>
            !mission.completed,
    )
    .sort(
        (
            a,
            b,
        ) =>
            this.priorityValue(
                b.priority,
            ) -
            this.priorityValue(
                a.priority,
            ),
        );

        return missions[0]?.id ??
        null;
    }

    //priority

    priorityValue(priority) {
        switch (
            String(priority).toLowerCase()
        ) {
            case "critical":
                return 4;

            case "high":
                return 3;

            case "normal":
                return 2;

            case "low":
                return 1;

            default:
                return 0;
        }
    }

    //render

    render() {
        this.renderActveMission();
        this.renderMissionList();
    }

    //render active mission
    renderActiveMission() {
        const mission =
        this.missions.get(
            this.activeMissionId,
        );


        if (!mission) {
            this.activeTitle.textContent =
            "No Active Mission";

            this.activeDescription.textContent =
            "Continue exploring the world";

            this.activeProgress.textContent =
            "0 / 0";

            this.activeProgressFill.style.width =
            "0%";

            return;
        }


        this.activeTitle.textContent =
        mission.title;

        this.activeDescription.textContent =
        mission.description;


        const progress =
        this.calculateProgress(
            mission,
        );


        const completedCount =
        mission.objectives.filter(
            (objective) =>
                objective.completed ||
            objective.current >=
            objective.required,
).length;


        this.activeProgress.textContent =
        `${completedCount} / ${mission.objectives.length}`;

        this.activeProgressFill.style.width =
        `${progress}%`;
}

//calculate progress

calculateProgress(
    mission,
) {
    if (
        !mission.objectives ||
        mission.objectives.length ===
        0
    ) {
        return mision.completed
        ? 100
        : 0;
    }

    let total =
    0;

    let completed = 
    0;



    for (
        const objective
        of mission.objectives
    ) {
        total +=
        Math.max(
            1,
            objective.required,
        );

        completed +=
        Math.min(
            objective.required,
            objective.current,
        );
    }


    if (
        total === 0
    ) {
        return0;
    }


    return Math.round(
        (
            completed /
            total
        ) * 100,
    );
}


//render full list

renderMissionList() {
    const missions =
    [...this.missions.values()]
    .filter(
        (mission) =>
            this.options.showCompleted ||
        !mission.completed,
)
.sort(
    (
        a,
        b,
    ) => {

        if (
            a.completed !==
            b.completed
        ) {
            return a.completed
            ? 1
            : -1;
        }


        return (
            this.priorityValue(
                b.priority,
            ) -
            this.priorityValue(
                a.priority,
            )
        );
    },
)
            .slice(
                0,
                this.options.maxVisibleMissions,
);

this.list.innerHTML =
"";

if (
    missions.length === 0
) {
    this.list.innerHTML = `
    <div class="mission-empty">
    No missions available
    </div>
    `;

    return;
}

for (
    const mission
    of missions
) {
    const element =
    this.createMissionElement(
        mission,
    );


    this.list.appendChild(
        element,
    );
}
}


//create mission element

createMissionElement(
    mission,
) {
    const element =
    document.createElement(
        "button",
    );

    element.type =
    "button";

    element.className =
    "mission-list-item";


    if (
        mission.id ===
        this.activeMissionId
    ) {
        element.classList.add(
            "active",
        );
    }


    if (
        mission.completed
    ) {
        element.classList.add(
            "completed",
        );
    }


    const completedObjectives =
    mission.objectives.filter(
        (objective) =>
            objective.completed ||
            objective.current >=
            objective.required,
).length;


const totalObjectives =
mission.objectives.length;


const progress =
this.calculateProgress(
    mission,
);


element.innerHTML = `
<div class="mission-list-main">

<div class="mission-list-category">
${this.escapeHtml(
    mission.category,
)}
</div>

<div class="mission-lit-title">
${this.escapeHtml(
    mission.title,
)}
</div>

</div>

<div class="mission-list-side">

<div class="mission-list-counter">
${
    mission.completed
    ? "DONE"
    : `${completedObjectives}/${totalObjectives}`
}
</div>

<div class="mission-mini-bar">
<div
class="mission-mini-fill"
style="width:${progress}%"
></div>
</div>

</div>
`;


element.addEventListener(
    "click",
    () => {

        if (
            mission.completed
        ) {
            return;
        }


        this.setActiveMission(
            mission.id,
        );

        this.collapseMissionLog();
    },
);

return element;
}

//toggle log

toggleMissionLog() {
    const isOpen =
    !this.list.classList.contains(
        "hidden",
    );


    if (isOpen) {
        this.collapseMissionLog();
    } else {
        this.expandMissionLog();
    }
}

//expand

expandMissionLog() {
    this.list.classList.remove(
        "hidden",
    );

    thos.root.classList.add(
        "expanded",
    );

    this.toggleButton.textContent =
    "CLOSE";
}

//collapse

collapseMissionLog() {
    this.list.classList.add(
        "hidden",
    );

    this.root.classList.remove(
        "expanded",
    );

    this.toggleButton.textContent =
    "LOG";
}

//get mission

getMission(id) {
    return this.missions.get(id) ?? null;
}

//get all

getMissions() {
    return [
        ...this.missions.values(),
    ];
}

//get active

getActiveMission() {
    if (
        !this.activeMissionId
    ) {
        return null;
    }

    return this.getMission(
        this.activeMissionId,
    );
}

//clear

clear() {
    this.missions.clear();

    this.activeMissionId =
    null;

    this.render();
}

//serialize

serialze() {
    return {
        actveMissionId:
        this.activeMissionId,


    missions:
    [...this.missions.values()]
    .map(
        (mission) => ({
            ...mission,


            objectives:
            mission.objectives.map(
                (objective) => ({
                    ...objective,
                    metadata: {
                        ...objective.metadata,
                    },
                }),
            ),

            metadata: {
                ...mission.metadata,
            },
        }),
    ),
};
}


// load state

loadState(state = {}) {
    this.clear();


    if (
        Array.isArray(
            state.missions,
        )
    ) {
        for (
            const mission 
            of state.missions
        ) {
            this.addMission(
                mission,
            );
        }
    }


    if (
        state.activeMissionId &&
        this.missions.has(
            state.activeMissionId,
        )
    ) {
        this.activeMissionId =
        state.activeMissionId;
    }


    this.render();
}


//event emitter

emitMissionEvent(
    name,
    data,
) {
    window.dispatchEvent(
        new CustomeEvent(
            `missions:${name}`,
            {
                detail:
                data,
            },
        ),
    );
}


//escape HTML

escapeHtml(value) {
    return String(value)
    .replaceAll(
        "&",
        "&amp",
    )
    .replaceAll(
        "<",
        "&lt;",
    )
    .replaceAll(
        ">",
        "*gt;",
    )
    .replaceAll(
        '"',
        "&quot;",
    )
    .replaceAll(
        "'",
        "&#039;",
    );
}
}

    

                


















