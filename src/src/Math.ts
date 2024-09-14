export function mean(...args:number[]){
  return args.reduce((a,b)=>a+b) / args.length;
}

export function median(...args:number[]){
  args.sort();
  if(args.length%2){
    return args[(args.length-1)/2];
  } else {
    return (args[args.length/2-1]+args[args.length/2])/2;
  }
}