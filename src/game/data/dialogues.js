import { deepFreeze} from "../core/utils.js";

export const DIALOGUES = deepFreeze({
    elara_intro: {
        id: 'elara_intro',
        npcId: 'elara',
        startNode: 'start',

        nodes: {
            start: {
                text: 'Ypu made it through the temporal rift. That means the signal is real.',

                choices: [
                    {
                        id: 'who_are_you',
                        test: 'Who are you?',
                        next: 'identity'
                    },

                    {
                        id: 'what_signal',
                        text: 'What signal',
                        next: 'signal'
                    }
                ]
            },

            identity: {
                text: 'I am DR.Elara Voss. I was investigating a temporal-energy anomaly when my expedition was pulled here.',
                choices: [
                    {
                        id: 'ask_help',
                        text: 'How can I help?',
                        next: 'help',

                        effects: {
                            setFlags: {
                                met_elara: true
                            }
                        }
                    },
                    {
                        id:'leave',
                        text: 'I need to explore.',
                        end: true
                    }
                ]
            },

            signal: {
                text:
                'A machine beneath this land is broadcasting a pattern that should not exist in this era.',
                choices: [
                    {
                        id: 'ask_location',
                        text: 'Where is the machine',
                        next: 'help'

                },
                    {
                        id: 'leave_signal',
                        text: 'I will investigate it',
                        end: true
                    }
                ]
            },
            help: {
                text:
                'Bring me the strange components you find. They may be the key to building a vehicle capable of surviving the next jump',

                choices: [
                    {
                        id: 'accept',
                        text: 'I will do it.',
                        end: true,

                        effects: {
                            setFlags: {
                                elara_mission_accepted: true
                            },

                            startQuest:
                            'inspect_ancient_site'
                        }
                    },

                    {
                        id: 'decline',
                        text: 'Not yet.',
                        end: true
                    }
                ]
            }
        }
    },

    sentinel_warning: {
        id: 'sentinel_warning',
        npcId: 'sentinel',
        startNode: 'warning',

        nodes: {
            warning: {
                text:
                'Temporal displacement detected. Further movement may fracture the route home',
                choices: [
                    {
                        id: 'continue',
                        text:'i accept the risk',
                        end: true,
                        effects: {
                            setFlags: {
                                sentinel_warning_heard: true
                            }
                        }
                    },

                    {
                        id: 'back_off',
                        text: 'I will wait.',
                        end: true,
                    }
                ]
            }
        }
    }
});

// Maybe the dialogue of npcs may change but this is the base