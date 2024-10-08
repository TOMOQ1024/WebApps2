import { redirect } from "next/navigation";

export const metadata = {
  title: "tomoq",
};

export default function Home() {
  redirect(`/apps`);
  return <main></main>;
}
