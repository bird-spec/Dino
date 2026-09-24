import { EVENTS } from "../core/events.js";
import {
    assertPositiveInteger,
    assertNonEmptyString
} from "../core/utils.js";
import {ValidationError} from "../core/errors.js";

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
        respawnSeconds = 0
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

        assertNonEmptyString(maxQuantity, 'maxQuantity');

        if (quantity > maxQuantity) {
            throw new ValidationError(
                'quantity cannot exceed maxQuantity.'
            );
        }

        this._getType(type);

        this.state.mutate(
            'resource.registerNode',

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

        return (id)
    }
}