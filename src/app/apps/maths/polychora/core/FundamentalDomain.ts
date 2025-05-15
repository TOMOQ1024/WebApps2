import { Matrix3, Vector3 } from "three";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";
import { MobiusGyrovectorSphericalSpace3 } from "@/src/maths/MobiusGyrovectorSphericalSpace3";
import { CoxeterNode } from "@/src/maths/CoxeterNode";

/**
 * 基本領域を取得する
 */
export function GetFundamentalDomain(labels: {
  [genPair: string]: [number, number];
}) {
  // point A
  const pointA = new Vector3(0, 0, 0);

  // hyperplane B,C,D
  const angleCD = Math.PI - (Math.PI / labels.cd[0]) * labels.cd[1];
  const angleDB = Math.PI - (Math.PI / labels.bd[0]) * labels.bd[1];
  const angleBC = Math.PI - (Math.PI / labels.bc[0]) * labels.bc[1];
  const planeB = new Vector3(1, 0, 0);
  const planeC = new Vector3(Math.cos(angleBC), Math.sin(angleBC), 0);
  const planeD = new Vector3(Math.cos(angleDB), 0, Math.sin(angleDB));
  planeD.applyAxisAngle(
    planeB,
    Math.asin(
      (Math.cos(angleCD) - Math.cos(angleDB) * Math.cos(angleBC)) /
        (Math.sin(angleDB) * Math.sin(angleBC))
    )
  );

  // hyperplane A
  const angleAB = Math.PI - (Math.PI / labels.ab[0]) * labels.ab[1];
  const angleAC = Math.PI - (Math.PI / labels.ac[0]) * labels.ac[1];
  const angleAD = Math.PI - (Math.PI / labels.ad[0]) * labels.ad[1];
  const sphereCenterA = new Vector3(
    Math.cos(angleAB),
    Math.cos(angleAC),
    Math.cos(angleAD)
  ).applyMatrix3(
    new Matrix3(
      ...planeB.toArray(),
      ...planeC.toArray(),
      ...planeD.toArray()
    ).invert()
  );
  const sphereRadiusA = 1 / Math.sqrt(1 - sphereCenterA.lengthSq());
  sphereCenterA.multiplyScalar(sphereRadiusA);

  // point B
  const pointB = planeC.clone().cross(planeD).normalize();
  pointB.multiplyScalar(
    pointB.dot(sphereCenterA) +
      Math.sqrt(
        pointB.dot(sphereCenterA) ** 2 -
          sphereCenterA.lengthSq() +
          sphereRadiusA * sphereRadiusA
      )
  );

  // point C
  const pointC = planeD.clone().cross(planeB).normalize();
  pointC.multiplyScalar(
    pointC.dot(sphereCenterA) +
      Math.sqrt(
        pointC.dot(sphereCenterA) ** 2 -
          sphereCenterA.lengthSq() +
          sphereRadiusA * sphereRadiusA
      )
  );

  // point D
  const pointD = planeB.clone().cross(planeC).normalize();
  pointD.multiplyScalar(
    pointD.dot(sphereCenterA) +
      Math.sqrt(
        pointD.dot(sphereCenterA) ** 2 -
          sphereCenterA.lengthSq() +
          sphereRadiusA * sphereRadiusA
      )
  );

  return {
    pointA,
    pointB:
      pointB.lengthSq() > 1
        ? MobiusGyrovectorSphericalSpace3.antipode(pointB)
        : pointB,
    pointC:
      pointC.lengthSq() > 1
        ? MobiusGyrovectorSphericalSpace3.antipode(pointC)
        : pointC,
    pointD:
      pointD.lengthSq() > 1
        ? MobiusGyrovectorSphericalSpace3.antipode(pointD)
        : pointD,
  };
}

/**
 * 初期点を取得する
 */
export function GetInitPoint(
  pointA: Vector3,
  pointB: Vector3,
  pointC: Vector3,
  pointD: Vector3,
  labels: { [genPair: string]: [number, number] },
  ni: { [gen: string]: string }
) {
  const planeA = MobiusGyrovectorSphericalSpace3.hyperplane(
    pointB,
    pointC,
    pointD
  );
  const planeB = MobiusGyrovectorSphericalSpace3.hyperplane(
    pointA,
    pointD,
    pointC
  );
  const planeC = MobiusGyrovectorSphericalSpace3.hyperplane(
    pointD,
    pointA,
    pointB
  );
  const planeD = MobiusGyrovectorSphericalSpace3.hyperplane(
    pointC,
    pointB,
    pointA
  );
  const planeMAB = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeA,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeB)
  );
  const planeMAC = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeA,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeC)
  );
  const planeMAD = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeA,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeD)
  );
  const planeMBC = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeB,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeC)
  );
  const planeMBD = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeB,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeD)
  );
  const planeMCD = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeC,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeD)
  );

  switch (`${ni.a}${ni.b}${ni.c}${ni.d}`) {
    case "xxxx":
      return MobiusGyrovectorSphericalSpace3.incenter4(
        pointA,
        pointB,
        pointC,
        pointD
      );

    case "xooo":
      return pointA;
    case "oxoo":
      return pointB;
    case "ooxo":
      return pointC;
    case "ooox":
      return pointD;

    case "xxoo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeC,
        planeD,
        planeMAB,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointB)
      );

    case "xoxo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeB,
        planeD,
        planeMAC,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointC)
      );
    case "xoox":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeB,
        planeC,
        planeMAD,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointD)
      );
    case "oxxo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeD,
        planeMBC,
        MobiusGyrovectorSphericalSpace3.mean(pointB, pointC)
      );
    case "oxox":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeC,
        planeMBD,
        MobiusGyrovectorSphericalSpace3.mean(pointB, pointD)
      );
    case "ooxx":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeB,
        planeMCD,
        MobiusGyrovectorSphericalSpace3.mean(pointC, pointD)
      );

    case "oxxx":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeMBC,
        planeMCD,
        MobiusGyrovectorSphericalSpace3.mean(pointB, pointC, pointD)
      );
    case "xoxx":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeB,
        planeMAD,
        planeMCD,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointC, pointD)
      );
    case "xxox":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeC,
        planeMAD,
        planeMAB,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointB, pointD)
      );
    case "xxxo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeD,
        planeMAC,
        planeMAB,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointB, pointC)
      );

    default:
      return MobiusGyrovectorSphericalSpace3.mean(
        pointA,
        pointB,
        pointC,
        pointD
      );
  }
}
