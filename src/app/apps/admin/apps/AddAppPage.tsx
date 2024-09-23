"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AddAppPage = () => {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [path, setPath] = useState("");
  const [tags, setTags] = useState(""); // カンマ区切りでタグを入力
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagArray = tags.length
      ? tags.split(",").map((tag) => tag.trim())
      : [];

    const response = await fetch("/api/apps/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        path,
        tags: tagArray,
      }),
    });

    if (response.ok) {
      console.log("Succeed to add app");
    } else {
      console.error("Failed to add app");
    }
  };

  if (!session) return <>無効なセッション</>;
  return (
    <div>
      <h1>Add New App</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>App Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Path</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <button type="submit">Add App</button>
      </form>
    </div>
  );
};

export default AddAppPage;
