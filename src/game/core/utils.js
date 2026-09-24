import { ValidationError } from './errors.js' ;

export function assertNonEmptyString(value, fieldname) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new ValidationError(`${fieldname} must be a non-empty string.`);
    }

    return value.trim()
}

export function assertPositiveInteger(value, fieldName) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new ValidationError(`${fieldName} must be a positive integer. `);
    }
    return value;
}
export function assertNonNegativeInteger(value, fieldName) {
    if (!Number.isInteger(value)||value < 0) {
        throw new ValidationError(`${fieldName} must be a non-negative integer. `);
    }
    return value;
}

export function deepClone(value) {
    if (value === undefined || value === null) {
        return value;
    }
    return JSON.parse(JSON.stringify(value))
}
export function deepFreeze(object) {
    if (!object || typeof object !== 'object' || Object.isFrozen(object)) {
        return object;
    }
    for (const value of Object.values(object)) {
        deepFreeze(value);
    }
    return Object.freeze(object);
}
export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function nowIso(){
    return new Date().toISOString();}

export function createId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
}

export function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}