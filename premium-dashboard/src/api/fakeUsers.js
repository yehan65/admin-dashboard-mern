const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@mail.com",
    role: "Admin",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@mail.com",
    role: "User",
    status: "Suspended",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 3,
    name: "Alex Brown",
    email: "alex@mail.com",
    role: "Editor",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 4,
    name: "Mike Wilson",
    email: "mike@mail.com",
    role: "User",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 5,
    name: "Emma Davis",
    email: "emma@mail.com",
    role: "Admin",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
];

export const fetchUsers = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(users);
    }, 2000);
    // reject("Fetch failed!");
  });
};

const posts = [
  {
    id: 1,
    title: "Tailwind Tips",
    author: "Yehan",
    status: "Published",
  },
  {
    id: 2,
    title: "React Dashboard",
    author: "Alice",
    status: "Draft",
  },
  {
    id: 3,
    title: "Fiverr Portfolio Guide",
    author: "Bob",
    status: "Published",
  },
  {
    id: 4,
    title: "Node js - What's New",
    author: "Yehan",
    status: "Published",
  },
  {
    id: 5,
    title: "Fullstack E-commerce app",
    author: "Sarah",
    status: "Published",
  },
];

export const fetchPosts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(posts);
    }, 1500);
  });
};
