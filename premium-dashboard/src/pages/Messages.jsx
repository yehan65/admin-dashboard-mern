import { useRef, useState } from "react";
import Modal from "../components/Modal";
import { XIcon } from "lucide-react";

export default function Messages() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messageRef = useRef();

  const messages = [
    {
      id: 1,
      name: "Dwayne Johnson",
      email: "therock@gmail.com",
      message: "Can you activate my account?",
      date: "1d ago",
      read: false,
    },
    {
      id: 2,
      name: "SERVER",
      email: "server care",
      message: "New user connected.",
      date: "5min ago",
      read: true,
    },
  ];

  function openMessageModal(msg) {
    setSelectedMessage(msg);

    messageRef.current.SHOW();
  }

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Messages</h1>
        <Modal
          ref={messageRef}
          onClose={() => messageRef.current.CLOSE()}
          className="rounded-2xl p-0 border-none backdrop:bg-black/50 m-auto shadow-2xl"
        >
          {selectedMessage && (
            <div className="w-[400px] bg-white dark:bg-gray-900 p-6 rounded-2xl">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {selectedMessage.name}
                </h2>
                <XIcon
                  size={24}
                  className="cursor-pointer"
                  onClick={() => messageRef.current.CLOSE()}
                />
              </div>

              {/* Email */}
              <p className="text-sm text-gray-500 mb-2">
                {selectedMessage.email}
              </p>

              {/* Message */}
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
                {selectedMessage.message}
              </div>

              {/* Footer */}
              <div className="mt-4 flex justify-end gap-2">
                <button className="text-sm text-red-500 hover:underline">
                  Delete
                </button>
                {selectedMessage.email !== "server care" && (
                  <button className="text-sm text-blue-600 hover:underline">
                    Reply
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => openMessageModal(msg)}
              className={`p-4 border-b transition ${!msg.read ? "bg-blue-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"} `}
            >
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {!msg.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                    <p className="font-semibold">{msg.name}</p>
                  </div>
                  <p className="text-sm text-gray-500">{msg.email}</p>
                </div>

                <span className="text-sm text-gray-400">{msg.date}</span>
              </div>

              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
