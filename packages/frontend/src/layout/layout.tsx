import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";

const Layout = ({
  children,
  showHeader = true,
  showFooter = true,
}: {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}) => {
  return (
    <body className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main
        role="main"
        className={`
          flex-grow
          ${
            showHeader && showFooter
              ? "h-[calc(100vh-4rem-3rem)]"
              : showHeader
              ? "h-[calc(100vh-4rem)]"
              : showFooter
              ? "h-[calc(100vh-2rem)]"
              : "h-screen"
          }
        `}
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </body>
  );
};

export default Layout;
