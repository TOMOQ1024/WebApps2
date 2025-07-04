import {
  Hyperplane3,
  MobiusGyrovectorSphericalSpace3,
} from "@/src/maths/MobiusGyrovectorSphericalSpace3";
import { Vector3 } from "three";

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
  const planeA = Hyperplane3.fromPoints(pointB, pointC, pointD);
  const planeB = Hyperplane3.fromPoints(pointA, pointD, pointC);
  const planeC = Hyperplane3.fromPoints(pointD, pointA, pointB);
  const planeD = Hyperplane3.fromPoints(pointC, pointB, pointA);
  const planeMAB = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeA,
    planeB.inverted()
  );
  const planeMAC = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeA,
    planeC.inverted()
  );
  const planeMAD = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeA,
    planeD.inverted()
  );
  const planeMBC = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeB,
    planeC.inverted()
  );
  const planeMBD = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeB,
    planeD.inverted()
  );
  const planeMCD = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeC,
    planeD.inverted()
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
