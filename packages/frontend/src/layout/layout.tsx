import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";

const Layout = ({
  children,
  showHeader,
  showFooter,
  showCentered = false,
}: {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showCentered?: boolean;
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main
        role="main"
        className={`
          flex-grow
          mx-32
          pb-10
          ${
            showCentered
              ? showHeader && showFooter
                ? "h-[calc(100vh-4.5rem-2rem-1px)]"
                : showHeader
                ? "h-[calc(100vh-4.5rem-1px)]"
                : showFooter
                ? "h-[calc(100vh-2rem)]"
                : "h-screen"
              : showHeader && showFooter
              ? "min-h-[calc(100vh-4.5rem-2rem-1px)]"
              : showHeader
              ? "min-h-[calc(100vh-4.5rem-1px)]"
              : showFooter
              ? "min-h-[calc(100vh-2rem)]"
              : "h-screen"
          }
        `}
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
