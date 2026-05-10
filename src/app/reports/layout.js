import OpenAIChat from "@/components/OpenAIChat";
import React from "react";

const Layout = ({ children }) => {
  return (
    <>
      <OpenAIChat />
      {children}
    </>
  );
};

export default Layout;
