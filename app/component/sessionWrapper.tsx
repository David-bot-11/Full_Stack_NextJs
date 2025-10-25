
"use client";

import { SessionProvider } from "next-auth/react";
import { use, type ReactNode } from 'react';



const SessionWrapper = ({ children }    : { children: ReactNode }) => {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}

export default SessionWrapper;

