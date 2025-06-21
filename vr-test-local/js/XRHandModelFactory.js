import { XRHandMeshModel } from './XRHandMeshModel.js';

export class XRHandModelFactory {

	constructor() {
		this.path = '';
		this.asset = null;
	}

	createHandModel( hand, type = 'mesh' ) {
		switch ( type ) {
			case 'mesh':
				return new XRHandMeshModel( hand, this.path, this.asset );
			default:
				console.warn( `Unknown hand model type: ${ type }` );
		}
	}
}
