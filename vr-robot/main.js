// === Entry Point === //

import { createScene } from './core/scene.js';
import { addLighting } from './core/lighting.js';
import { createFloor } from './core/floor.js';

import { buildRobot } from './robot/model.js';
import { setupHierarchy } from './robot/hierarchy.js';
import { addAxesToRobot } from './robot/axes.js';

import { setupControllers } from './controllers/input.js';
import { applyControlMapping } from './controllers/control-mapping.js';

import { initDebugPanel, updateDebugPanel } from './utils/debug-panel.js';
import { logStatus } from './utils/logger.js'; // <-- nuovo

try {
  const { scene, camera, renderer } = createScene();
  logStatus('✅ createScene completato');

  addLighting(scene);
  logStatus('✅ addLighting completato');

  createFloor(scene);
  logStatus('✅ createFloor completato');

  const robot = buildRobot(scene);
  logStatus('✅ buildRobot completato');

  setupHierarchy(robot);
  logStatus('✅ setupHierarchy completato');

  scene.add(robot.root);  // <-- aggiunto!
  logStatus('✅ robot.root aggiunto alla scena');

  addAxesToRobot(robot);
  logStatus('✅ addAxesToRobot completato');

  const controllers = setupControllers(scene, renderer);
  logStatus('✅ setupControllers completato');

  initDebugPanel(camera);
  logStatus('✅ initDebugPanel completato');

  renderer.setAnimationLoop(() => {
    applyControlMapping(robot, controllers);
    updateDebugPanel(controllers);
    renderer.render(scene, camera);
  });
  logStatus('✅ Animation loop avviato');

} catch (err) {
  logStatus('❌ Errore in main.js: ' + err.message, true);
  console.error(err);
}
