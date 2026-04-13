import { useContext } from "react";
import { AuthContext } from "../context/Auth";

export const useAuthToken = () => {
  const { user } = useContext(AuthContext);

  const cleanToken =
    typeof user === "string" ? user.replace(/^"|"$/g, "") : user;
  return cleanToken;
};
