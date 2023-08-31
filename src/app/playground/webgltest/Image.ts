// https://pisuke-code.com/js-load-image-synchronously/
export default async function loadImage(imgUrl: string){
  let img: HTMLImageElement | null = null;
  let promise = new Promise(function(resolve){
    img = new Image();
    img.onload = function(){
      console.log('loaded : '+imgUrl);
      resolve(0);
    }
    img.src = imgUrl;
  });
  await promise;
  return img as unknown as HTMLImageElement;
}