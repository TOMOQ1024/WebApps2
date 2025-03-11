type Data = {
  vert: string;
  frag: string;
};

export default async function CreateModule(device: GPUDevice) {
  try {
    let response = await fetch("/api/shaders/mandelbrotset");
    const data: Data = await response.json();

    return device.createShaderModule({
      label: "mandel shaders",
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
