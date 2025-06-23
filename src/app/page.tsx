import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  console.log(user);
  return <h1 className="text-primary">Hello World</h1>;
}
