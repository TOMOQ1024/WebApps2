type Data = {
  vert: string;
  frag: string;
};

export default async function CreateModule(device: GPUDevice) {
  try {
    let response = await fetch("/api/shaders/gasket");
    const data: Data = await response.json();

    return device.createShaderModule({
      label: "gasket shaders",
      code: `
        ${data.vert}
        ${data.frag}
      `,
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}
