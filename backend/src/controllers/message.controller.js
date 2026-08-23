import User from "../models/user.model.js";
import Message from "../models/message.model.js"
import { io, getReceiverSocketId } from "../lib/socket.js";
export async function getUsersForSidebar(req,res){
    try {
        const loggedInUserId=req.user._id;

        const users= await User.find({_id:{$ne:loggedInUserId}}).select("-clerkId");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getUsersforSidebar:",error.message);
        res.status(500).json({
            message:"Internal server error while getting users for sidebar"
        });
        
    }
}

// export async function getConversationsForSidebar(req, res) {
//   try {
//     const loggedInUserId = req.user._id;

//     const conversations = await Message.aggregate([
//       // 1. Keep only the messages I sent or received.
//       { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
//       // 2. Collapse them into one row per chat partner, noting our latest message time.
//       {
//         $group: {
//           // The partner is the other person on the message (not me).
//           _id: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] },
//           lastMessageAt: { $max: "$createdAt" },
//         },
//       },
//       // 3. Put the most recent conversation at the top.
//       { $sort: { lastMessageAt: -1 } },
//       // 4. Look up each partner's user profile (comes back as an array).
//       { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
//       // 5. Pull that profile out of the array and make it the document.
//       { $replaceRoot: { newRoot: { $first: "$user" } } },
//       // 6. Hide the private clerkId field from the result.
//       { $project: { clerkId: 0 } },
//     ]);

//     res.status(200).json(conversations);
//   } catch (error) {
//     console.error("Error in getConversationsForSidebar:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }
export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      // 1. Only messages involving the logged-in user
      {
        $match: {
          $or: [
            { senderId: loggedInUserId },
            { receiverId: loggedInUserId },
          ],
        },
      },

      // 2. Get the OTHER user from every message
      {
        $project: {
          partnerId: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          createdAt: 1,
        },
      },

      // 3. One conversation per partner
      {
        $group: {
          _id: "$partnerId",
          lastMessageAt: {
            $max: "$createdAt",
          },
        },
      },

      // 4. Latest conversation first
      {
        $sort: {
          lastMessageAt: -1,
        },
      },

      // 5. Get the partner's User document
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      // 6. Convert user array to object
      {
        $unwind: "$user",
      },

      // 7. Return the user document
      {
        $replaceRoot: {
          newRoot: "$user",
        },
      },

      // 8. Don't expose Clerk ID
      {
        $project: {
          clerkId: 0,
        },
      },
    ]);

    console.log(
      "👥 CONVERSATIONS FOR:",
      loggedInUserId.toString()
    );

    console.log(
      "➡️ CONVERSATION USERS:",
      conversations.map((user) => ({
        id: user._id.toString(),
        name: user.fullName,
      }))
    );

    res.status(200).json(conversations);
  } catch (error) {
    console.error(
      "Error in getConversationsForSidebar:",
      error
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal server error in getting chat of perticular user" });
  }
}

// export async function sendMessage(req,res){
//     try {
//     const { text } = req.body;
//     const { id: receiverId } = req.params;
//     const senderId = req.user._id;

//     let imageUrl;
//     let videoUrl;

//     if (req.file) {
//       if (!hasImageKitConfig()) {
//         return res.status(500).json({ message: "Media upload is not configured" });
//       }

//       const url = await uploadChatMedia(req.file);
//       if (req.file.mimetype.startsWith("video/")) videoUrl = url;
//       else imageUrl = url;
//     }

//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       text,
//       image: imageUrl,
//       video: videoUrl,
//     });

//     await newMessage.save();

//     const receiverSocketId = getReceiverSocketId(receiverId);
//     // only send the message in realtime if user is online
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", newMessage);
//     }

//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.error("Error in sendMessage:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }

// }

export async function sendMessage(req, res) {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let videoUrl;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res.status(500).json({
          message: "Media upload is not configured",
        });
      }

      const url = await uploadChatMedia(req.file);

      if (req.file.mimetype.startsWith("video/")) {
        videoUrl = url;
      } else {
        imageUrl = url;
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    console.log("========== SOCKET MESSAGE ==========");
    console.log("Sender ID:", senderId.toString());
    console.log("Receiver ID:", receiverId.toString());
    console.log("Receiver Socket ID:", receiverSocketId);

    if (receiverSocketId) {
      console.log("✅ Emitting newMessage to:", receiverSocketId);

      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      console.log("❌ Receiver is NOT connected");
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}