import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  if (location.pathname === "/") return null;

  return (
    <nav className="text-sm text-gray-500 my-4">
      <ul className="flex items-center space-x-2">
        <li>
          <Link to="/" className="text-blue-500 hover:underline">
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const pathTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          return (
            <li key={index} className="flex items-center">
              <span className="mx-1">/</span>
              {isLast ? (
                <span className="text-gray-700">{value}</span>
              ) : (
                <Link to={pathTo} className="text-blue-500 hover:underline">
                  {value}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
