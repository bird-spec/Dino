import * as THREE from 'three'
// this needs to find collision, make a log for the ids if they touched and what it touched,
// and if the object is a static like ground it should make it offset back upwards


export const checkGround = (objName, groundID) => {
    const objectBox = new THREE.Box3().setFromObject(objName)
    const groundBox = new THREE.Box3().setFromObject(groundID)
    return objectBox.intersectsBox(groundBox) // if its touching ground
}


export const checkCollision = (objID1, objID2) => { // later i just wanna name objects touching instead of checking collision
    // but this should work well for enemies specifically
    const objectBox = new THREE.Box3().setFromObject(objID1)
    const objectBox2 = new THREE.Box3().setFromObject(objID2)
    return objectBox.intersectsBox(objectBox2) // if 2 objects are touching
}
