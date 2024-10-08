export interface IPost {
  id: number;
  author: {
    name: string;
  };
  iteration: number;
  z0Expression: string;
  expression: string;
  radius: number;
  originX: number;
  originY: number;
  createdAt: string;
  tags: {
    tag: {
      name: string;
    };
  }[];
}
