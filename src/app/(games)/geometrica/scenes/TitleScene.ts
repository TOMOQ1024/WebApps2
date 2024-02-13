import * as PIXI from 'pixi.js';
import Scene from "@/src/Scene";
import Core from "../Core";

export default class TitleScene implements Scene {
  app: PIXI.Application;

  constructor (public parent: Core) {
    this.app = parent.app;
  }

  init(): boolean {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0xffff00, 1);
    graphics.beginFill(0x881188, 0.25);
    graphics.drawRoundedRect(
      this.app.screen.width/2-200/2,
      this.app.screen.height/2-70/2,
      200, 70, 10
    );
    graphics.endFill();

    this.app.stage.addChild(graphics as PIXI.DisplayObject);

    graphics.eventMode = 'static';
    graphics.cursor = 'pointer';
    graphics
      .on('pointerdown', ()=>{console.log('clicked')})
      // .on('pointerup', onButtonUp)
      // .on('pointerupoutside', onButtonUp)
      .on('pointerover', ()=>{
        graphics.alpha=.6;
        richText.alpha=.6;
      })
      .on('pointerout', ()=>{
        graphics.alpha=1;
        richText.alpha=1;
      });

    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fill: '#666600', // gradient
      stroke: '#ffff00',
      strokeThickness: 2,
      dropShadow: true,
      dropShadowColor: 'white',
      dropShadowBlur: 4,
      dropShadowDistance: 0,
      lineJoin: 'round',
      align: 'center',
    });
    
    const richText = new PIXI.Text('START', style);
    
    richText.anchor.set(0.5, 0.5);
    richText.position.set(
      this.app.screen.width/2,
      this.app.screen.height/2
    );
    
    this.app.stage.addChild(richText as PIXI.DisplayObject);
    return true;
  }

  update(): boolean {
    throw new Error("Method not implemented.");
  }
  
  render(): boolean {
    throw new Error("Method not implemented.");
  }
}