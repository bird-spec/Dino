import { EVENTS } from "../core/events.js";
import {
    assertPositiveInteger,
    assertNonEmptyString
} from "../core/utils.js";
import {NotFoundError, ValidationError} from "../core/errors.js";

export class ResourceSystem {
    constructor({
        state,
        eventBus,
        inventory,
        resourceCatalog
    }) {
        this.state = state;
        this.eventBus = eventBus;
        this.inventory = inventory;
        this.resourceCatalog = resourceCatalog;
    }

    registerNode({
        id,
        type,
        quantity,
        maxQuantity = quantity,
        respawnSeconds = 0,
        metadata = {}
    }) {
        assertNonEmptyString(
            id,
            'resource node id'
        );
        assertNonEmptyString(
            type,
            'resource node type'
        );

        assertPositiveInteger(quantity, 'quantity');

        assertPositiveInteger(maxQuantity, 'maxQuantity');

        if (quantity > maxQuantity) {
            throw new ValidationError(
                'quantity cannot exceed maxQuantity.'
            );
        }

        this._getType(type);

        this.state.mutate(
            'resource.registerNode',

            (state) => {
                state.resource.nodes[id] = {
                    id,
                    type,
                    quantity,
                    maxQuantity,
                    respawnSeconds,
                    metadata
                };
            },


            {
                eventType:
                EVENTS.RESOURCE_NODE_REGISTERED,

                payload: {
                    nodeId: id,
                    removed: true
                }
            }
        );
    }

    unregisterNode(id) {
        if (
            !this.state.read(
                (state) =>
                    Boolean(state.resources.nodes[id])
            )
        ) {
            return false;
        }
        this.state.mutate(
            'resource.unregisterNode',

            (state) => {
                delete state.resources.nodes[id];
            },

            {
                eventType:
                EVENTS.RESOURCE_NODE_REGISTERED,
                payload: {
                    nodeId: id,
                    removed: true
                }
            }
        );
        return true;
    }

    getNode(id) {
        const node =
            this.state.read(
                (state) =>
                    state.resources.nodes[id]
            );

        if (!node) {
            throw new NotFoundError(
                `Unknown resource  node ${id}.`
            );
        }
        return node;
    }

    getNodeQuantity(id) {
        return this.getNode(id).quantity;
    }

    listNodes() {
        return this.state.read(
            (state) => ({
                ...state.resources.nodes
            })
        );
    }
    harvest(
        nodeId,
        harvestUnits = 1,
        {
            source = 'world',
            playerId = 'player'
        } = {}
    ) {
        assertPositiveInteger(
            harvestUnits,
            'harvestUnits'
        );

        const node =
            this.getNode(nodeId);

        const type =
            this._getType(node.type);
        const units =
            Math.min(
                harvestUnits,
                node.quantity
            );
        if (units <= 0){
            return {
                harvestedUnits: 0,
                itemId: type.yieldItemId,
                quantity: 0
            };
        }

        const itemQuantity =
            units * type.defaultYieldPerHarvest;

        const capacityCheck =
            this.inventory.canAdd(
                type.yieldItemId,
                itemQuantity
            );
        if (!capacityCheck.ok) {
            throw new ValidationError(
                `inventory is full of ${itemQuantity} x ${type.yieldItemId}.`
            );
        }

        this.inventory.add(
            type.yieldItemId,
            itemQuantity,
            {
                source: `resource:${source}`,
            }
        );

        this.state.mutate(
            'resource.harvest',

            (state) => {
                state.resources.nodes[nodeId].quantity -= units;
            },
            {
                eventType:
                EVENTS.RESOURCE_HARVESTED,

                payload: {
                    nodeId,
                    resourceType: node.type,
                    itemId: type.yieldItemId,
                    quantity: itemQuantity,
                    harvestedUnits: units,
                    source,
                    playerId
                }
            }
        );
        return {
            harvestedUnits: units,
            itemId : type.yieldItemId,
            quantity: itemQuantity
        };
    }

    respawn(nodeId, quantity = undefined) {
        const node =
            this.getNode(nodeId);
        const nextQuantity =
            quantity ?? node.maxQuantity;
        if (
            nextQuantity < 0 ||
            nextQuantity > node.maxQuantity
        ) {
            throw new ValidationError(
                `Respawn quantity must be between 0 and ${node.maxQuantity}.`
            );
        }

        this.state.mutate(
            'resource.respawn',
            (state) => {
                state.resources.nodes[nodeId].quantity = nextQuantity;
            },

            {
                eventType:
                EVENTS.RESOURCE_RESPAWNED,
                payload: {
                    nodeId,
                    quantity: nextQuantity
                }
            }
        );

        return this.getNode(nodeId);
    }

    _getType(typeId) {
        const definition =
            this.resourceCatalog[typeId];

        if (!definition) {
            throw new NotFoundError(
                `Unknown resource type: ${typeId}.`
            );
        }
        return definition;
    }
}