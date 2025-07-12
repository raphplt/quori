"use client";

import React from "react";
import { GitHubEvent } from "@/types/githubEvent";
import { useAuthenticatedQuery } from "@/hooks/useAuthenticatedQuery";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const {
    data: event,
    isLoading,
    error,
  } = useAuthenticatedQuery<GitHubEvent>(["event", id], `/github/events/${id}`);

  if (isLoading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div>
        <h1>Event not found</h1>
        <p>The event with ID {id} could not be found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Event ID: {id}</h1>
      <pre>{JSON.stringify(event, null, 2)}</pre>
    </div>
  );
}
