import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [collpase, setCollapse] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} collapsed={collpase} />

      <div className="flex-1 w-full">
        <Navbar
          toggleCollapse={() => setCollapse(!collpase)}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
