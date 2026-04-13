import { useContext, useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import toast from "react-hot-toast";
import "react-loading-skeleton/dist/skeleton.css";
import { fetchUsers } from "../api/fakeUsers";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AuthContext } from "../context/Auth";
import { CircleUserRound, XIcon } from "lucide-react";
import { queryClient } from "../client/client";
import Modal from "../components/Modal";

export default function Users({}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [roleUpdate, setRoleUpdate] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useContext(AuthContext);
  const dialog = useRef();
  const statusRef = useRef();
  const roleRef = useRef();
  const usersPerPage = 4;

  const cleanToken =
    typeof user === "string" ? user.replace(/^"|"$/g, "") : user;

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:8000/admin/getAllUsers",
        {
          headers: {
            "x-auth-token": cleanToken,
          },
        },
      );
      return response.data.allUsers;
    },
  });

  const {
    mutate,
    isPending: newUserPending,
    isError: isNewUserError,
    error: newUserError,
  } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        "http://localhost:8000/admin/newUser",
        data,
        {
          headers: {
            "x-auth-token": cleanToken,
          },
        },
      );
      console.log("response", response.data);
      return response.data;
      // response.data returns --> token and the newUser
    },
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ["allUsers"] });

      const previousUsers = queryClient.getQueryData(["allUsers"]);
      queryClient.setQueryData(["allUsers"], (oldUsers = []) => [
        ...oldUsers,
        {
          ...newUser,
          status: "Active",
          _id: Date.now().toString(),
        },
      ]);

      return { previousUsers };
    },
    onError: (error, _, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["allUsers"], context.previousUsers);
      }
      console.error(error);
      toast.error("User update failed!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
    onSuccess: () => {
      toast.success("User updated!");
    },
  });

  const {
    mutate: updateUserRole,
    isPending: isRoleUpdatePending,
    isError: isRoleUpdateError,
  } = useMutation({
    mutationFn: async ({ id, role }) => {
      const response = await axios.put(
        `http://localhost:8000/admin/${id}/role/update`,
        { role },
        {
          headers: {
            "x-auth-token": cleanToken,
          },
        },
      );
      console.log(response.data);
      return response.data;
    },
    onMutate: async ({ id, role }) => {
      await queryClient.cancelQueries({ queryKey: ["allUsers"] });

      const previous = queryClient.getQueryData(["allUsers"]);
      queryClient.setQueryData(
        ["allUsers"],
        (oldUsers = []) =>
          oldUsers.map((user) => (user._id === id ? { ...user, role } : user)),
        // const filteredUser = oldUsers.filter((user) => user._id === data._id);
        // return {
        //   ...oldUsers,
        //   filteredUser: {
        //     role: data.role,
        //   },
        // };
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["allUsers"], context.previous);
      }
      console.error(error);
      toast.error("User update failed!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
    onSuccess: () => {
      toast.success("User updated!");
      setSelectedUser(null);
      setRoleUpdate(null);
      handleCloseRoleModal();
      handleCloseModal();
    },
  });

  const {
    mutate: updateUserStatus,
    isPending: isStatusUpdatePending,
    isError: isStatusUpdateError,
  } = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await axios.put(
        `http://localhost:8000/admin/${id}/status/update`,
        {
          status,
        },
        {
          headers: {
            "x-auth-token": cleanToken,
          },
        },
      );
      return response.data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["allUsers"] });
      const previous = queryClient.getQueryData(["allUsers"]);
      queryClient.setQueryData(["allUsers"], (oldUsers = []) =>
        oldUsers.map((user) => (user._id === id ? { ...user, status } : user)),
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["allUsers"], context?.previous);
      }
      console.error(error);
      toast.error("User update failed!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
    onSuccess: () => {
      toast.success("User updated!");
      setSelectedUser(null);
      setStatusUpdate(null);
      handleCloseStatusModal();
      handleCloseModal();
    },
  });

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesRole = role === "All" || user.role === role;

    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortField) return 0;

    if (a[sortField] < b[sortField]) {
      return sortOrder === "asc" ? -1 : 1;
    }

    if (a[sortField] > b[sortField]) {
      return sortOrder === "asc" ? 1 : -1;
    }

    return 0;
  });

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;

  const currentUsers = sortedUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) return <p className="text-center">Loading...</p>;

  if (newUserPending) {
    <h4 className="text-center text-green-900">Updating...</h4>;
  }

  if (isNewUserError) {
    <h4 className="text-center text-red-900">Coudln't update the user!</h4>;
  }

  if (isRoleUpdatePending) {
    <h4 className="text-center text-green-900">Updating...</h4>;
  }

  if (isRoleUpdateError) {
    <h4 className="text-center text-red-900">Coudln't update the user!</h4>;
  }

  if (isStatusUpdatePending) {
    <h4 className="text-center text-green-900">Updating...</h4>;
  }

  if (isStatusUpdateError) {
    <h4 className="text-center text-red-900">Coudln't update the user!</h4>;
  }

  function handleOpenModal(user) {
    setSelectedUser(user);
    dialog.current.SHOW();
  }

  function handleCloseModal() {
    setSelectedUser(null);
    dialog.current.CLOSE();
  }

  function handleOpenStatusModal() {
    statusRef.current.SHOW();
  }

  function handleCloseStatusModal() {
    setStatusUpdate(null);
    statusRef.current.CLOSE();
  }

  function handleOpenRoleModal() {
    roleRef.current.SHOW();
  }

  function handleCloseRoleModal() {
    setRoleUpdate(null);
    roleRef.current.CLOSE();
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // function handleSaveUser() {
  //   if (editUser) {
  //     setUsers(
  //       users.map((user) =>
  //         user.id === editUser.id ? { ...form, id: editUser.id } : user,
  //       ),
  //     );
  //     toast.success("User updated!");
  //   } else {
  //     const newUser = {
  //       id: Date.now(),
  //       ...form,
  //     };

  //     setUsers([newUser, ...users]);
  //     toast.success("User created!");
  //   }

  //   setOpenModal(false);
  //   setEditUser(null);

  //   setForm({
  //     name: "",
  //     email: "",
  //     role: "User",
  //   });
  // }

  // function confirmDelete() {
  //   setUsers(users.filter((u) => u.id !== deleteUser.id));
  //   setDeleteUser(null);
  //   toast.success("User deleted!");
  // }

  function handleSubmit(e) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      mutate(data);
      setOpenModal(false);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "User",
      });
    } catch (error) {
      console.error("handleSubmit:", error);
    }
  }

  function handleUserRoleUpdate(id, role) {
    updateUserRole({ id, role });
  }

  function handleUserStatusUpdate(id, status) {
    updateUserStatus({ id, status });
  }

  // console.log(roleUpdate);

  return (
    <div className="p-6 space-y-6">
      <Modal
        ref={dialog}
        onClose={handleCloseModal}
        className="rounded-xl p-0 border-none backdrop:bg-black/50 m-auto shadow-2xl transition-all duration-200 ease-out"
      >
        <div className="w-80 bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibond">User Actions</h2>
            <XIcon
              size={30}
              onClick={handleCloseModal}
              className="cursor-pointer text-gray-500 hover:text-red-500"
            />
          </div>
          <article className="flex flex-col gap-3">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              onClick={handleOpenRoleModal}
            >
              Change Role
            </button>
            <button
              className="bg-yellow-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
              onClick={handleOpenStatusModal}
            >
              Change Status
            </button>
          </article>
        </div>
      </Modal>
      <Modal
        ref={roleRef}
        onClose={handleCloseRoleModal}
        className="rounded-2xl p-0 border-none backdrop:bg-black/50 m-auto shadow-2xl transition-all duration-200 ease-out"
      >
        <div className="w-80 bg-white dark:bg-gray-900 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibond">User Actions</h2>
            <XIcon
              size={30}
              onClick={handleCloseRoleModal}
              className="cursor-pointer text-gray-500 hover:text-red-500"
            />
          </div>

          <select
            className="w-full border rounded-lg p-2 mb-4 dark:bg-gray-800"
            value={roleUpdate || selectedUser?.role}
            onChange={(e) => setRoleUpdate(e.target.value)}
          >
            <option value="Admin">Admin</option>
            <option value="User">User</option>
            <option value="Editor">Editor</option>
          </select>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            onClick={() =>
              handleUserRoleUpdate(
                selectedUser._id,
                roleUpdate || selectedUser.role,
              )
            }
          >
            Update Role
          </button>
        </div>
      </Modal>
      <Modal
        ref={statusRef}
        onClose={handleCloseStatusModal}
        className="rounded-2xl p-0 border-none backdrop:bg-black/50 m-auto shadow-2xl transition-all duration-200 ease-out"
      >
        <div className="w-80 bg-white dark:bg-gray-900 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibond">Change Status</h2>
            <XIcon
              size={30}
              onClick={handleCloseStatusModal}
              className="cursor-pointer text-gray-500 hover:text-red-500"
            />
          </div>
          <select
            className="w-full border rounded-lg p-2 mb-4 dark:bg-gray-800"
            value={statusUpdate || selectedUser?.status}
            onChange={(e) => setStatusUpdate(e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
          <button
            className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
            onClick={() =>
              handleUserStatusUpdate(
                selectedUser._id,
                statusUpdate || selectedUser.status,
              )
            }
          >
            Update Status
          </button>
        </div>
      </Modal>

      <h2 className="text-2xl font-bold mb-4 dark:text-white">Users</h2>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search users..."
            className="border p-2 rounded w-full"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            onChange={(e) => setRole(e.target.value)}
          >
            <option>All</option>
            <option>Admin</option>
            <option>User</option>
            <option>Editor</option>
          </select>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 text-white m-5 px-4 py-2 rounded"
        >
          Add User
        </button>
        {/* table */}
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <th
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase"
                onClick={() => {
                  setSortField("name");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Name
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase"
                onClick={() => {
                  setSortField("email");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                Role
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase"
                onClick={() => {
                  setSortField("status");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading
              ? Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <Skeleton />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton />
                      </td>
                    </tr>
                  ))
              : currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="dark:hover:bg-gray-700 transition"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {user?.avatar ? (
                          <img
                            src={user?.avatar}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <CircleUserRound
                            size={40}
                            // className="w-10 h-10 rounded-full"
                          />
                        )}
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    {user.role !== "Admin" ? (
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={() => handleOpenModal(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => setDeleteUser(user)}
                        >
                          Delete
                        </button>
                      </td>
                    ) : (
                      <p>Admin cannot take actions for their own account</p>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add User</h2>
            <form onSubmit={handleSubmit}>
              <input
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                name="name"
                className="border p-2 w-full mb-2"
              />

              <input
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                name="email"
                className="border p-2 w-full mb-2"
              />

              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                name="password"
                className="border p-2 w-full mb-2"
              />

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border p-2 w-full mb-4"
              >
                <option>User</option>
                <option>Admin</option>
                <option>Editor</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-3 py-1 bg-gray-300 rounded cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  // onClick={handleSaveUser}
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 text-white rounded cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96">
            <h2 className="text-xl font-semibold mb-2">Delete User</h2>

            <p className="text-gray-500 mb-4">
              Are you sure you want to delete {deleteUser.name}?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteUser(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                // onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
