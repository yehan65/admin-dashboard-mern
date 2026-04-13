import { useContext, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { fetchPosts } from "../api/fakeUsers";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AuthContext } from "../context/Auth";

export default function Posts({}) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    status: "Published",
  });
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [editPost, setEditPost] = useState(null);
  const [deletePost, setDeletePost] = useState(null);
  // useState(null)
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  // useEffect(() => {
  //   setLoading(true);
  //   fetchPosts().then((data) => {
  //     setPosts(data);
  //     setLoading(false);
  //   });
  // }, []);

  const { user } = useContext(AuthContext);

  const cleanToken =
    typeof user === "string" ? user.replace(/^"|"$/g, "") : user;

  const { data = [] } = useQuery({
    queryKey: ["allPosts"],
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:8000/admin/getAllPosts",
        {
          headers: {
            "x-auth-token": cleanToken,
          },
        },
      );
      return response.data.posts;
    },
  });



  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus = status === "All" || post.status === status;

    return matchesSearch && matchStatus;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (!sortField) return 0;

    if (a[sortField] < b[sortField]) {
      return sortOrder === "asc" ? -1 : 1;
    }

    if (a[sortField] > b[sortField]) {
      return sortOrder === "asc" ? 1 : -1;
    }

    return 0;
  });

  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;

  const currentPosts = sortedPosts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSavePost() {
    if (editPost) {
      setPosts(
        posts.map((post) =>
          post.id === editPost.id ? { ...form, id: editPost.id } : post,
        ),
      );
      toast.success("Post updated!");
    } else {
      const newPost = {
        id: Date.now(),
        ...form,
      };
      setPosts([newPost, ...posts]);
      toast.success("Post created!");
    }

    setOpenModal(false);
    setEditPost(null);

    setForm({
      title: "",
      author: "",
      status: "Published",
    });
  }

  function confirmDelete() {
    setPosts(posts.filter((post) => post.id !== deletePost.id));
    setDeletePost(null);
    toast.success("Post deleted!");
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Posts</h2>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search posts..."
            className="border p-2 rounded w-full"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>
        {/* <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 text-white m-5 px-4 py-2 rounded"
        >
          Add Post
        </button> */}
        {posts.length === 0 && (
          <div className="text-center py-10 text-gray-500">No posts found</div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <th
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase"
                onClick={() => {
                  setSortField("title");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Title
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase"
                onClick={() => {
                  setSortField("author");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Author
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
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
              : currentPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                      {post.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                      {post.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <button
                        className="text-blue-500 hover:underline"
                        // onClick={() => {
                        //   setForm(post);
                        //   setEditPost(post);
                        //   setOpenModal(true);
                        // }}
                      >
                        Suspend
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => setDeletePost(post)}
                      >
                        Delete
                      </button>
                    </td>
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
            <h2 className="text-xl font-bold mb-4">Add Post</h2>

            <input
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              name="title"
              className="border p-2 w-full mb-2"
            />
            <input
              placeholder="Author"
              value={form.author}
              onChange={handleChange}
              name="author"
              className="border p-2 w-full mb-2"
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border p-2 w-full mb-4"
            >
              <option>Published</option>
              <option>Draft</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenModal(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSavePost}
                className="px-3 py-1 bg-indigo-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {deletePost && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96">
            <h2 className="text-xl font-semibold mb-2">Delete Post</h2>

            <p className="text-gray-500 mb-4">
              Are you sure you want to delete {deletePost.author}'s post?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletePost(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
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
