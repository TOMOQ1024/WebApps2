import { useState, useCallback } from "react";

export function useShaderUpdater(initialShader: string) {
  const [shader, setShader] = useState(initialShader);

  const updateShader = useCallback(
    (updates: {
      iterations?: number;
      function?: string;
      renderMode?: number;
    }) => {
      setShader(() => {
        let newShader = initialShader;

        if (updates.iterations !== undefined) {
          newShader = newShader.replace(
            /for\(int i = 0; i < \d+\/\* input iter here \*\/; i\+\+\)/,
            `for(int i = 0; i < ${updates.iterations}; i++)`
          );
        }

        if (updates.function !== undefined) {
          newShader = newShader.replace(
            /z = z\/\* input func here \*\/;/,
            `z = ${updates.function};`
          );
        }

        if (updates.renderMode !== undefined) {
          newShader = newShader.replace(
            /switch\(\d+\/\* render mode here \*\/\)/,
            `switch(${updates.renderMode}/* render mode here */)`
          );
        }

        // console.log(newShader);
        return newShader;
      });
    },
    []
  );

  return { shader, updateShader };
}
