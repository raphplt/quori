import React from "react";
import { Button } from "@/components/ui/button";
import { AuthStatus } from "@/components/auth-status";

const page = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quori</h1>
        <AuthStatus />
      </div>

      <div className="text-center">
        <p className="text-xl mb-4">
          Transforme tes commits en publications LinkedIn
        </p>
        <Button>Commencer</Button>
      </div>
    </div>
  );
};

export default page;
