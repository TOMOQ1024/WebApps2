import AceEditor, { IMarker } from 'react-ace';

import 'brace/mode/glsl';
import 'brace/theme/ambiance';
import Core from '../Core';

const markers: IMarker[] = [
  {
    startRow: 3,
    startCol: 1,
    endRow: 4,
    endCol: 1,
    className: 'glsl-editor-marker',
    type: 'text',
    inFront: true,
  },
];

export default function GLSLEditor ({ core }: {
  core: Core|null;
}) {
  const handleChange = (value: string) => {
    if (!core) return;
    core.frag = value;
  };

  return (
    <div className='glsl-editor'>
      {core && <AceEditor
        mode="glsl"
        theme="ambiance"
        onChange={handleChange}
        width="100%"
        height='100%'
        name="ace-editor"
        editorProps={{ $blockScrolling: false }}
        defaultValue={core.frag}
        showGutter={true}
        highlightActiveLine={true}
        showPrintMargin={true}
        setOptions={{
          // enableBasicAutocompletion: false,
          // enableLiveAutocompletion: false,
          // enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
        markers={markers}
      />}
    </div>
  );
}
