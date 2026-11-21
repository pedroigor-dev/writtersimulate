"use client";

import { useEffect } from "react";

const ART = `%c
   ██╗   ██╗ ██████╗ ██╗   ██╗██████╗
   ╚██╗ ██╔╝██╔═══██╗██║   ██║██╔══██╗
    ╚████╔╝ ██║   ██║██║   ██║██████╔╝
     ╚██╔╝  ██║   ██║██║   ██║██╔══██╗
      ██║   ╚██████╔╝╚██████╔╝██║  ██║
      ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
%c
   ██╗    ██╗██████╗ ██╗████████╗████████╗███████╗██████╗
   ██║    ██║██╔══██╗██║╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
   ██║ █╗ ██║██████╔╝██║   ██║      ██║   █████╗  ██████╔╝
   ██║███╗██║██╔══██╗██║   ██║      ██║   ██╔══╝  ██╔══██╗
   ╚███╔███╔╝██║  ██║██║   ██║      ██║   ███████╗██║  ██║
    ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

   %c Design & Dev · @devpedro %c

   %chttps://www.instagram.com/_pedroigorc/`;

let signed = false;

export default function Signature() {
  useEffect(() => {
    if (signed) return;
    signed = true;
    console.log(
      ART,
      "color: #ffc8c8; font: 400 1em monospace;",
      "color: #f2f2f2; font: 400 1em monospace;",
      "background-color: #ffc8c8; color: black; font: 400 1em monospace; padding: 0.5em 0; font-weight: bold;",
      "",
      "color: #888; font: 400 0.9em monospace;",
    );
  }, []);

  return null;
}
