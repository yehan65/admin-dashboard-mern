import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { AuthContext } from "../context/Auth";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { user } = useContext(AuthContext);

  const cleanToken =
    typeof user === "string" ? user.replace(/^"|"$/g, "") : user;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "me", cleanToken],
    queryFn: async () => {
      const repsonse = await axios.get("http://localhost:8000/admin/getAdmin", {
        headers: {
          "x-auth-token": cleanToken,
        },
      });

      return repsonse.data.user;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const response = await axios.patch(
        "http://localhost:8000/admin/update/password",
        { currentPassword, newPassword },
        {
          headers: {
            "x-auth-token": cleanToken,
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
  });

  function handleNewPassword(e) {
    setNewPassword(e.target.value);
  }

  function handleCurrentPassword(e) {
    setCurrentPassword(e.target.value);
  }
  function handleSubmit(e) {
    e.preventDefault();

    mutate({ currentPassword, newPassword });
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 flex flex-col gap-5"
      >
        <h1 className="text-2xl font-semibold text-center">Edit password</h1>
        <article className="flex flex-col gap-1">
          <label
            htmlFor="oldPassword"
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            Current Password
          </label>
          <input
            type="text"
            name="currentPassword"
            value={currentPassword}
            onChange={handleCurrentPassword}
            placeholder="Current Password"
            className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
        </article>
        <article className="flex flex-col gap-1">
          <label
            htmlFor="newPassword"
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            New Password
          </label>
          <input
            type="text"
            name="password"
            value={newPassword}
            onChange={handleNewPassword}
            placeholder="New Passsword"
            className="p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
        </article>
        <button
          disabled={!newPassword}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
          type="submit"
        >
          {isPending ? "Updating..." : "Update"}
        </button>
      </form>
    </>
  );
}
