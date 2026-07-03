import { Hyperplane3 } from "@/src/maths/MobiusGyrovectorSphericalSpace3";
import { GetFundamentalDomain } from "./FundamentalDomain";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";
import { getCombinations } from "@/src/maths/CombinationUtils";
import { getPermutations } from "@/src/maths/PermutationUtils";

describe("A1 A1 A1 A1", () => {
  test("1/1", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [2, 1],
        ad: [2, 1],
        bc: [2, 1],
        bd: [2, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
});

describe("A2 A1 A1", () => {
  test("1/6", () => {
    expect(
      testFundamentalDomain({
        ab: [3, 1],
        ac: [2, 1],
        ad: [2, 1],
        bc: [2, 1],
        bd: [2, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
  test("2/6", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [3, 1],
        ad: [2, 1],
        bc: [2, 1],
        bd: [2, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
  test("3/6", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [2, 1],
        ad: [3, 1],
        bc: [2, 1],
        bd: [2, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
  test("4/6", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [2, 1],
        ad: [2, 1],
        bc: [3, 1],
        bd: [2, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
  test("5/6", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [2, 1],
        ad: [2, 1],
        bc: [2, 1],
        bd: [3, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
  test("6/6", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [2, 1],
        ad: [2, 1],
        bc: [2, 1],
        bd: [2, 1],
        cd: [3, 1],
      }),
    ).toBe(false);
  });
});

describe("B2 A1 A1", () => {
  test("1/6", () => {
    expect(
      testFundamentalDomain({
        ab: [4, 1],
        ac: [2, 1],
        ad: [2, 1],
        bc: [2, 1],
        bd: [2, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
  test("2/6", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [4, 1],
        ad: [2, 1],
        bc: [2, 1],
        bd: [2, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
  test("3/6", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [2, 1],
        ad: [4, 1],
        bc: [2, 1],
        bd: [2, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
  test("4/6", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [2, 1],
        ad: [2, 1],
        bc: [4, 1],
        bd: [2, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
  test("5/6", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [2, 1],
        ad: [2, 1],
        bc: [2, 1],
        bd: [4, 1],
        cd: [2, 1],
      }),
    ).toBe(false);
  });
  test("6/6", () => {
    expect(
      testFundamentalDomain({
        ab: [2, 1],
        ac: [2, 1],
        ad: [2, 1],
        bc: [2, 1],
        bd: [2, 1],
        cd: [4, 1],
      }),
    ).toBe(false);
  });
});

describe("A3 A1 / A2 A2", () => {
  const combinations = getCombinations([0, 1, 2, 3, 4, 5], 2);
  for (let i = 0; i < combinations.length; i++) {
    const combination = combinations[i];
    test(`${i + 1}/${combinations.length}`, () => {
      expect(
        testFundamentalDomain({
          ab: [combination.indexOf(0) >= 0 ? 3 : 2, 1],
          ac: [combination.indexOf(1) >= 0 ? 3 : 2, 1],
          ad: [combination.indexOf(2) >= 0 ? 3 : 2, 1],
          bc: [combination.indexOf(3) >= 0 ? 3 : 2, 1],
          bd: [combination.indexOf(4) >= 0 ? 3 : 2, 1],
          cd: [combination.indexOf(5) >= 0 ? 3 : 2, 1],
        }),
      ).toBe(false);
    });
  }
});

describe("B3 A1 / B2 A2", () => {
  const combinations = getCombinations([0, 1, 2, 3, 4, 5], 2);
  for (let i = 0; i < combinations.length; i++) {
    const combination = combinations[i];
    test(`${i * 2 + 1}/${combinations.length * 2}`, () => {
      expect(
        testFundamentalDomain({
          ab: [combination.indexOf(0) < 0 ? 2 : 3 + combination.indexOf(0), 1],
          ac: [combination.indexOf(1) < 0 ? 2 : 3 + combination.indexOf(1), 1],
          ad: [combination.indexOf(2) < 0 ? 2 : 3 + combination.indexOf(2), 1],
          bc: [combination.indexOf(3) < 0 ? 2 : 3 + combination.indexOf(3), 1],
          bd: [combination.indexOf(4) < 0 ? 2 : 3 + combination.indexOf(4), 1],
          cd: [combination.indexOf(5) < 0 ? 2 : 3 + combination.indexOf(5), 1],
        }),
      ).toBe(false);
    });
    test(`${i * 2 + 2}/${combinations.length * 2}`, () => {
      expect(
        testFundamentalDomain({
          ab: [combination.indexOf(0) < 0 ? 2 : 4 - combination.indexOf(0), 1],
          ac: [combination.indexOf(1) < 0 ? 2 : 4 - combination.indexOf(1), 1],
          ad: [combination.indexOf(2) < 0 ? 2 : 4 - combination.indexOf(2), 1],
          bc: [combination.indexOf(3) < 0 ? 2 : 4 - combination.indexOf(3), 1],
          bd: [combination.indexOf(4) < 0 ? 2 : 4 - combination.indexOf(4), 1],
          cd: [combination.indexOf(5) < 0 ? 2 : 4 - combination.indexOf(5), 1],
        }),
      ).toBe(false);
    });
  }
});

describe("A4 / D4", () => {
  const combinations = getCombinations([0, 1, 2, 3, 4, 5], 3);
  for (let i = 0; i < combinations.length; i++) {
    const combination = combinations[i];
    test(`${i + 1}/${combinations.length}`, () => {
      expect(
        testFundamentalDomain({
          ab: [combination.indexOf(0) >= 0 ? 3 : 2, 1],
          ac: [combination.indexOf(1) >= 0 ? 3 : 2, 1],
          ad: [combination.indexOf(2) >= 0 ? 3 : 2, 1],
          bc: [combination.indexOf(3) >= 0 ? 3 : 2, 1],
          bd: [combination.indexOf(4) >= 0 ? 3 : 2, 1],
          cd: [combination.indexOf(5) >= 0 ? 3 : 2, 1],
        }),
      ).toBe(false);
    });
  }
});

function testFundamentalDomain(labels: {
  [genPair: string]: [number, number];
}) {
  const diagram = new CoxeterDynkinDiagram(labels);
  if (diagram.calculateGroupType() !== "affine") return false;

  const { pointA, pointB, pointC, pointD } = GetFundamentalDomain(labels);
  const planeA = Hyperplane3.fromPoints(pointB, pointC, pointD);
  const planeB = Hyperplane3.fromPoints(pointA, pointD, pointC);
  const planeC = Hyperplane3.fromPoints(pointD, pointA, pointB);
  const planeD = Hyperplane3.fromPoints(pointC, pointB, pointA);
  const FDTOBJ: {
    [key: string]: { expected: number; actual: number; diff?: number };
  } = {
    AB: {
      expected: (Math.PI / labels.ab[0]) * labels.ab[1],
      actual: planeA.angleTo(planeB),
    },
    AC: {
      expected: (Math.PI / labels.ac[0]) * labels.ac[1],
      actual: planeA.angleTo(planeC),
    },
    AD: {
      expected: (Math.PI / labels.ad[0]) * labels.ad[1],
      actual: planeA.angleTo(planeD),
    },
    BC: {
      expected: (Math.PI / labels.bc[0]) * labels.bc[1],
      actual: planeB.angleTo(planeC),
    },
    BD: {
      expected: (Math.PI / labels.bd[0]) * labels.bd[1],
      actual: planeB.angleTo(planeD),
    },
    CD: {
      expected: (Math.PI / labels.cd[0]) * labels.cd[1],
      actual: planeC.angleTo(planeD),
    },
  };
  for (const key in FDTOBJ) {
    FDTOBJ[key].diff = Math.abs(FDTOBJ[key].actual - FDTOBJ[key].expected);
  }

  return Object.values(FDTOBJ).some((x) => Math.abs(x.diff!) > 1e-6);
}
