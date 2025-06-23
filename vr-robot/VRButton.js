export const VRButton = {

	createButton: function ( renderer, options ) {

		if ( options && options.referenceSpaceType ) {

			renderer.xr.setReferenceSpaceType( options.referenceSpaceType );

		}

		function showEnterVR( device ) {

			let currentSession = null;

			async function onSessionStarted( session ) {

				session.addEventListener( 'end', onSessionEnded );

				await renderer.xr.setSession( session );
				button.textContent = 'EXIT VR';
				currentSession = session;

			}

			function onSessionEnded() {

				currentSession.removeEventListener( 'end', onSessionEnded );

				button.textContent = 'ENTER VR';
				currentSession = null;

			}

			const button = document.createElement( 'button' );
			button.style.position = 'absolute';
			button.style.bottom = '20px';
			button.style.left = '50%';
			button.style.transform = 'translateX(-50%)';
			button.style.padding = '12px 24px';
			button.style.background = '#222';
			button.style.color = '#fff';
			button.style.border = 'none';
			button.style.cursor = 'pointer';
			button.textContent = 'ENTER VR';

			button.onclick = function () {

				if ( currentSession === null ) {

					const sessionInit = {
						optionalFeatures: [ 'local-floor', 'bounded-floor', 'hand-tracking' ]
					};
					navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( onSessionStarted );

				} else {

					currentSession.end();

				}

			};

			return button;

		}

		function disableButton() {

			const button = document.createElement( 'button' );
			button.disabled = true;
			button.textContent = 'VR NOT SUPPORTED';
			return button;

		}

		function showWebXRNotFound() {
			return disableButton();
		}

		if ( 'xr' in navigator ) {
			const button = showEnterVR();
			return button;
		} else {
			return showWebXRNotFound();
		}

	}

};
