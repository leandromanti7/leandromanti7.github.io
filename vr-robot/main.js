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

const { scene, camera, renderer } = createScene();

addLighting(scene);
createFloor(scene);

const robot = buildRobot(scene);
setupHierarchy(robot);
addAxesToRobot(robot);

const controllers = setupControllers(scene, renderer);
initDebugPanel(camera);

renderer.setAnimationLoop(() => {
  applyControlMapping(robot, controllers);
  updateDebugPanel(controllers);
  renderer.render(scene, camera);
});
