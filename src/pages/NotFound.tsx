import { Link, useLocation } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

const NotFound = () => {
  const location = useLocation();
  usePageMeta("Page not found");
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">
        There's nothing at <code className="rounded bg-white/5 px-1.5 py-0.5 text-sm">{location.pathname}</code>.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="btn-primary">Back to home</Link>
        <Link to="/example" className="btn-secondary">See an example analysis</Link>
      </div>
    </div>
  );
};

export default NotFound;
