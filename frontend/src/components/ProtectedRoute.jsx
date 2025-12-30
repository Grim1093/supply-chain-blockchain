import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ roleId, allowedRoles, children }) => {
  // Check if the current role is in the list of allowed roles
  const isAllowed = allowedRoles.includes(roleId);

  // 隼 LOGGING: This is your "Point of Failure" tracker
  useEffect(() => {
    if (isAllowed) {
      console.log(`✅ Access Granted: User Role (${roleId}) is in allowed list [${allowedRoles.join(", ")}]`);
    } else {
      console.warn(`🔒 Access Denied: User Role (${roleId}) is NOT in allowed list [${allowedRoles.join(", ")}]. Redirecting to Home.`);
    }
  }, [roleId, allowedRoles, isAllowed]);

  // If not allowed, kick them back to Home ("/")
  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  // If allowed, show the page (the "children")
  return children;
};

export default ProtectedRoute;