'use client';
import { useEffect } from "react";
import { Engine, Render, Runner, Composites, Common, MouseConstraint, Mouse, Composite, Bodies } from 'matter-js';

export default function MainWrapper() {
  useEffect(() => {
    const engine = Engine.create();
    const world = engine.world;

    const wr = document.querySelector('#main-wrapper') as HTMLElement;
    const render = Render.create({
      element: wr,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        showAngleIndicator: true,
      }
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    const stack = Composites.stack(20, 20, 10, 5, 0, 0, function (x: number, y: number) {
      var sides = Math.round(Common.random(1, 8));

      // round the edges of some bodies
      var chamfer = null;
      if (sides > 2 && Common.random() > 0.7) {
        chamfer = {
          radius: 10
        };
      }

      switch (Math.round(Common.random(0, 1))) {
        case 0:
          if (Common.random() < 0.8) {
            return Bodies.rectangle(x, y, Common.random(25, 50), Common.random(25, 50), { chamfer: chamfer } as Matter.IChamferableBodyDefinition);
          } else {
            return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(25, 30), { chamfer: chamfer } as Matter.IChamferableBodyDefinition);
          }
        case 1:
          return Bodies.polygon(x, y, sides, Common.random(25, 50), { chamfer: chamfer } as Matter.IChamferableBodyDefinition);
      }
    });

    Composite.add(world, stack);

    Composite.add(world, [
      Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
      Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
      Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
      Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });

    Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: 800, y: 600 }
    });

    wr.appendChild(render.canvas);
  })

  return (
    <main id='main-wrapper'>
    </main>
  );
}
