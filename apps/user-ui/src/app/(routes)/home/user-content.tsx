

export async function getUser() {
  try {
    const url = `${process.env.NEXT_PUBLIC_SERVER_URI}/api/logged-in-user`;

    console.log("Fetching:", url);

    const res = await fetch(url,
      { 
      cache: "no-store" , 
      credentials: "include"});

    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}