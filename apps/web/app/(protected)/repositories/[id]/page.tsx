import React from "react";

export default function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  return (
    <main>
      <p>This is the detail page for repository with ID: {id}.</p>
    </main>
  );
}
