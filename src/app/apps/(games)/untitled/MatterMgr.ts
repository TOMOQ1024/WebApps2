import { Engine, Render, Runner, Composites, Common, MouseConstraint, Mouse, Composite, Bodies } from 'matter-js';
import Map from './Map';

export default class MatterMgr {
  engine = Engine.create();
  world = this.engine.world;
  wr = document.querySelector('#main-wrapper') as HTMLElement;
  render = Render.create({
    element: this.wr,
    engine: this.engine,
    options: {
      width: 800,
      height: 600,
      showAngleIndicator: true,
    }
  });
  runner = Runner.create();
  mouse = Mouse.create(this.render.canvas);
  mouseConstraint = MouseConstraint.create(this.engine, {
    mouse: this.mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });

  constructor() {
    Render.run(this.render);
    Runner.run(this.runner, this.engine);

    Composite.add(this.world, [
      Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
      Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
      Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
      Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    Composite.add(this.world, this.mouseConstraint);

    // keep the mouse in sync with rendering
    this.render.mouse = this.mouse;

    // fit the render viewport to the scene
    Render.lookAt(this.render, {
      min: { x: 0, y: 0 },
      max: { x: 800, y: 600 }
    });

    this.wr.appendChild(this.render.canvas);
  }
  
  loadMap (map: Map) {
    this.world
    Composite.clear(this.world, true);
  }
}