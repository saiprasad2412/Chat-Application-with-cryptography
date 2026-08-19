import User from "../models/user.model.js";
import Message from "../models/message.model.js"
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

export async function getConversationsForSidebar(req,res){
    try {
        const loggedInUserId=req.user._id;
        const conversations=await Message.aggregate([
            //keep only msg i sent or received.
            {$match:{$or:[{senderId:loggedInUserId},{receiverId:loggedInUserId}]}},
            //collapse them into one row per chat partner, noting our latest msg time
            {
                $group:{
                    //partner is other person
                    _id:{$cond:[{$eq:["$senderId",loggedInUserId]},"$receiverId","$senderId"]},
                    lastMessageAt:{$max:"$createdAt"},
                },
            },
            //put most recent convo on top
            {$sort:{lastMessageAt:-1}},
            //look up each partner's profile (come back as an arrray).
            {$lookup:{from:"users",localField:"_id", as:"user"}},
            //pull that profile out of array and make it the document.
            {$replaceRoot:{newRoot:{$first:"$user"}}},
            //hide the private clerkId field from result.
            {$project:{clerId:0}},
        ]);
        res.status(200).json(conversations)
    } catch (error) {
        console.error("Error in getting conversatins", error.message);
        res.status(500).json({message:"Internal server error in getting conversatons"})
        
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

export async function sendMessage(req,res){
    try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let videoUrl;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res.status(500).json({ message: "Media upload is not configured" });
      }

      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) videoUrl = url;
      else imageUrl = url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();

    // const receiverSocketId = getReceiverSocketId(receiverId);
    // // only send the message in realtime if user is online
    // if (receiverSocketId) {
    //   io.to(receiverSocketId).emit("newMessage", newMessage);
    // }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }

}