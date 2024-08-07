type actorInbox = {
  id: string;
  inbox: string;
}

export async function actorFetchAsync(actor: string): Promise<actorInbox> {
  const options: RequestInit={
    method: "GET",
    headers: {
      Accept: "application/activity+json"
    }
  }
  
  const response =  await fetch(actor, options);
  if (!response.ok){
    throw new Error(`Failed fetch actor!: ${actor}`);
  }
  const data: actorInbox = await response.json();
  return data;
}
