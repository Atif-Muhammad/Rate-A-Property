import { LoaderIcon } from "lucide-react";
import React from "react";

function Loader() {
  return (
    <div className="flex justify-center items-center mt-4">
      <LoaderIcon className="animate-spin h-6 w-6 text-gray-600" />
    </div>
  );
}

export default Loader;
