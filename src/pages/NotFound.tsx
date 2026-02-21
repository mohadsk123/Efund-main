import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Frown } from "lucide-react"; // Import an icon for the 404 page

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 animate-fade-in">
      <div className="text-center space-y-6">
        <Frown className="h-24 w-24 text-primary mx-auto animate-bounce-slow" /> {/* Added icon with animation */}
        <h1 className="text-6xl font-extrabold text-foreground mb-2">404</h1>
        <p className="text-2xl text-muted-foreground mb-4">Oops! Page not found</p>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors duration-200 dark:neon-hover">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
