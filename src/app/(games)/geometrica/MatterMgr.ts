import * as MATTER from 'matter-js';

export default class MatterMgr {
  constructor () {
    let engine = MATTER.Engine.create();
    let world = engine.world;
    let render = MATTER.Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        showAngleIndicator: true
      }
    });
    MATTER.Render.run(render);
    let runner = MATTER.Runner.create();
    MATTER.Runner.run(runner, engine);

    let mouse = MATTER.Mouse.create(render.canvas);
    let mouseConstraint = MATTER.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

    render.mouse = mouse;

    MATTER.Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: 800, y: 600 }
  });
  }
}