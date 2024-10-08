import * as CANNON from 'cannon-es';

export const dieMaterial = new CANNON.Material('dieMaterial');

export const dieContactMaterial = new CANNON.ContactMaterial(dieMaterial, dieMaterial, {
  friction: 7e-4,
  restitution: .5,
  contactEquationStiffness: 1e4,
  contactEquationRelaxation: 4
});