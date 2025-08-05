import { Search } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";

const Searchbar = () => {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        width={16}
      />
      <Input
        placeholder="Taper / pour rechercher"
        className="pl-10 pr-4 w-64"
      />
    </div>
  );
};

export default Searchbar;
