import { authenticatedFetch } from "@/lib/api-client";
import React from "react";
import { Button } from "../ui/button";

const AddActivity = () => {
  const env = process.env.NODE_ENV;
  if (env !== "development" || !env) {
    return null;
  }

  const handleAddActivity = () => {
    console.log("add activity");
    authenticatedFetch("/github/events/test", {
      method: "POST",
      body: JSON.stringify({
        delivery_id: "123",
        event: "test",
        event_type: "push",
        payload: {
          test: "test",
        },
        repo_full_name: "test",
        author_login: "test",
      }),
    });
  };
  return (
    <Button variant="outline" size="sm" onClick={handleAddActivity}>
      Ajouter une activité
    </Button>
  );
};

export default AddActivity;
