import * as THREE from './three.module.js';

export class XRHandMeshModel extends THREE.Object3D {

	constructor( hand, path = '', asset = null ) {
		super();
		this.hand = hand;
		this.path = path;
		this.asset = asset;
		this.mesh = null;

		this.initMesh();
	}

	initMesh() {
		const geometry = new THREE.SphereGeometry( 0.01, 8, 8 );
		const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );

		for ( let i = 0; i < 25; i++ ) {
			const jointMesh = new THREE.Mesh( geometry, material );
			jointMesh.name = i;
			this.add( jointMesh );
		}
	}

	updateMatrixWorld( force ) {
		super.updateMatrixWorld( force );

		if ( this.hand.joints ) {
			this.children.forEach( ( jointMesh ) => {
				const joint = this.hand.joints[ jointMesh.name ];
				if ( joint && joint.visible ) {
					jointMesh.visible = true;
					jointMesh.position.copy( joint.position );
					jointMesh.quaternion.copy( joint.quaternion );
				} else {
					jointMesh.visible = false;
				}
			} );
		}
	}
}
