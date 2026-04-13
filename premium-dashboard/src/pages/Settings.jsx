import { useContext, useEffect, useRef, useState } from "react";
import { User, ArrowRight } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { AuthContext } from "../context/Auth";
import Modal from "../components/Modal";
import { queryClient } from "../client/client";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Settings() {
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  const dialog = useRef();
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const cleanToken =
    typeof user === "string" ? user.replace(/^"|"$/g, "") : user;

  const {
    data,
    isLoading,
    isSuccess,
    isError: isLoadingError,
    error: loadingError,
  } = useQuery({
    queryKey: ["admin", "me", cleanToken],
    queryFn: async () => {
      const response = await api.get("/admin/getAdmin", {
        headers: {
          "x-auth-token": cleanToken,
        },
      });

      return response.data.user;
    },
  });

  const [form, setForm] = useState({
    name: data?.name,
    email: data?.email,
    password: "",
    avatar: data?.avatar,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setForm(data);
    }
  }, [isSuccess, data]);

  function getUpdatedFields(form, data) {
    const updated = {};

    if (form.name !== data.name) {
      updated.name = form.name;
    }
    if (form.email !== data.email) {
      updated.email = form.email;
    }
    console.log(updated);
    return updated;
  }

  const { mutate: updateAvatar, isPending: updateAvatarPending } = useMutation({
    mutationFn: async (data) => {
      const response = await api.put("/admin/updateAvatar", data, {
        headers: {
          "x-auth-token": cleanToken,
        },
      });
      return response.data;
    },
    onMutate: async (formData) => {
      const file = formData.get("avatar");
      if (!file) return;
      const previewImg = URL.createObjectURL(file);
      console.log(formData);
      await queryClient.cancelQueries({
        queryKey: ["admin", "me", cleanToken],
      });

      const previous = queryClient.getQueryData(["admin", "me", cleanToken]);
      queryClient.setQueryData(["admin", "me", cleanToken], (old) => ({
        ...(old || {}),
        avatar: previewImg,
      }));
      return { previous, previewImg };
    },
    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["admin", "me", cleanToken],
          context?.previous,
        );
      }
      toast.error(error?.response?.data?.message);
    },
    onSettled: (data, _, context) => {
      if (context?.previewImg) {
        URL.revokeObjectURL(context?.previewImg);
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "me", cleanToken] });
      setImage(null);
      setPreview(null);
    },
    onSuccess: (data) => {
      toast.success("Photo updated!");
      setImage(null);
      setPreview(null);
      handleCloseModal();
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (updatedFields) => {
      const response = await api.patch("/admin/updateAdmin", updatedFields, {
        headers: {
          "x-auth-token": cleanToken,
        },
      });
      return response.data;
    },
    onMutate: async (updatedFields) => {
      await queryClient.cancelQueries({
        queryKey: ["admin", "me", cleanToken],
      });

      const previous = queryClient.getQueryData(["admin", "me", cleanToken]);
      queryClient.setQueryData(["admin", "me", cleanToken], (old) => ({
        ...old,
        ...updatedFields,
      }));
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["admin", "me", cleanToken],
          context?.previous,
        );
      }
      toast.error(
        `Couldn't save the changes! ${error?.response?.data?.message}`,
      );
      console.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "me", cleanToken] });
    },
    onSuccess: (data) => {
      setUser(data.token);
      localStorage.setItem("user", data.token);
      console.log("Token saved to localStorage ✅");
      toast.success("User updated!");
    },
  });

  if (isLoading) {
    return <h4 className="text-center text-green-900">Loadng...</h4>;
  }

  if (isLoadingError) {
    return (
      <h4 className="text-center text-red-900">Couldn't load the details!</h4>
    );
  }

  if (updateAvatarPending) {
    <h4 className="text-center text-green-900">Updating Avatar...</h4>;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleModalOpen() {
    dialog.current.SHOW();
  }

  function handleCloseModal() {
    setImage(null);
    setPreview(null);
    dialog.current.CLOSE();
  }

  function handleImagePreview(e) {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    // const formData = new FormData(e.target);
    // const data = Object.fromEntries(formData);

    const updatedFields = getUpdatedFields(form, data);
    if (Object.keys(updatedFields).length === 0) {
      toast("No changes made");
      return;
    }

    mutate(updatedFields);
  }

  function handleAvatar(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    // const data = Object.fromEntries(formData);

    updateAvatar(formData);
  }

  return (
    <>
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        <section className="mt-10">
          <div className=" bg-white dark:bg-gray-900 rounded-2xl shadow p-6 flex flex-col gap-6">
            {/* Profile */}
            <div>
              <h2 className="font-semibold mb-3">Profile</h2>
              <section className="flex items-center justify-center m-10 p-0">
                {form?.avatar ? (
                  <article onClick={handleModalOpen}>
                    <img
                      className="w-[200px] h-[200px] rounded-full object-cover"
                      src={form?.avatar}
                      alt="user avatar"
                    />
                    <Modal
                      ref={dialog}
                      onClose={handleCloseModal}
                      className="rounded-2xl p-5 border-none backdrop:bg-black/50 m-auto shadow-2xl"
                    >
                      <form onSubmit={handleAvatar}>
                        <input
                          type="file"
                          name="avatar"
                          id="avatar"
                          onChange={handleImagePreview}
                        />
                        {image && (
                          <img
                            className="w-[100px] h-[100px]"
                            src={preview}
                            alt="Profile Picture"
                          />
                        )}
                        <button
                          className="bg-blue-500 text-white mt-[5px] px-4 py-2 rounded"
                          type="submit"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          className="bg-red-600 text-white ml-[10px] px-4 py-2 rounded"
                          onClick={handleCloseModal}
                        >
                          Close modal
                        </button>
                      </form>
                    </Modal>
                  </article>
                ) : (
                  <article
                    className="border-1 rounded-full p-5"
                    onClick={handleModalOpen}
                  >
                    <User color="grey" size={100} />
                    <Modal
                      ref={dialog}
                      onClose={handleCloseModal}
                      className="rounded-2xl p-5 border-none backdrop:bg-black/50 m-auto shadow-2xl"
                    >
                      <form onSubmit={handleAvatar}>
                        <input
                          type="file"
                          name="avatar"
                          id="avatar"
                          onChange={handleImagePreview}
                        />
                        {image && (
                          <img
                            className="w-[100px] h-[100px]"
                            src={preview}
                            alt="Profile Picture"
                          />
                        )}
                        <button
                          className="bg-blue-500 text-white mt-[5px] px-4 py-2 rounded"
                          type="submit"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          className="bg-red-600 text-white ml-[10px] px-4 py-2 rounded"
                          onClick={handleCloseModal}
                        >
                          Close modal
                        </button>
                      </form>
                    </Modal>
                  </article>
                )}
              </section>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  value={form?.name ?? ""}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full p-2 border rounded-lg mb-3 bg-gray-100 dark:bg-gray-800"
                />

                <input
                  type="email"
                  name="email"
                  value={form?.email ?? ""}
                  // placeholder={form?.email ?? ""}
                  placeholder="Email"
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
                />
                {/* Actions */}
                <div className="flex justify-end mt-5">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <div
                className="flex justify-between"
                onClick={() => navigate("/edit/password")}
              >
                <h2 className="font-semibold mb-3">Change Password</h2>
                <ArrowRight />
              </div>
              <div className="flex justify-between">
                <h2 className="font-semibold mb-3">Account Deletion</h2>
                <ArrowRight />
              </div>
              {/* <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="New Password"
              className="w-full p-2 border rounded-lg dark:bg-gray-800"
            /> */}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
