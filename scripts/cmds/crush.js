const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const crushCaptions = [
  "প্রেমে যদি অপূর্ণতাই সুন্দর হয়, তবে পূর্ণতার সৌন্দর্য কোথায়?❤️",
  "যদি বৃষ্টি হতাম… তোমার দৃষ্টি ছুঁয়ে দিতাম! 🤗",
  "তোমার ভালোবাসার প্রতিচ্ছবি দেখেছি বারে বার💖",
  "তোমার সাথে একটি দিন ভালো, কিন্তু সব দিন হলে সেটা ভালোবাসা🌸",
  "এক বছর নয়, কয়েক জন্ম শুধু তোমার প্রেমেই হারাতে চাই😍",
  "মনটা তোমাকেই দিয়ে বসে আছি 🫶",
  "পিছু পিছু ঘুরলে প্রেম না, কাছে এলে ভালোবাসা হয়❤️‍🩹",
  "তুমি থাকলেই সব ঠিক লাগে 😊",
  "তোমার হাত ধরলে মনে হয় পৃথিবীটা পেয়ে গেছি 🥰",
  "তোমার প্রতি ভালো লাগা প্রতিদিন বাড়ছেই 😘"
];

module.exports = {
  config: {
    name: "crush",
    version: "1.0.1",
    author: "siyuuuu",
    countDown: 5,
    role: 0,
    shortDescription: "Crush banner 😏",
    longDescription: "Mention/reply দিলে crush banner বানায় 💖",
    category: "fun",
    guide: {
      en: "{pn} @mention / reply"
    }
  },

  onStart: async function ({ event, api }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    let targetID = null;

    // detect target
    if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply && messageReply.senderID) {
      targetID = messageReply.senderID;
    }

    if (!targetID) {
      return api.sendMessage(
        "😒 Reply বা mention দে আগে!",
        threadID,
        messageID
      );
    }

    try {
      // get api list
      const apiList = await axios.get(
        "https://raw.githubusercontent.com/shahadat-sahu/SAHU-API/refs/heads/main/SAHU-API.json"
      );

      const AVATAR_API = apiList.data?.AvatarCanvas;

      if (!AVATAR_API) throw new Error("API not found!");

      // call api
      const res = await axios.post(
        `${AVATAR_API}/api`,
        {
          cmd: "crush",
          senderID,
          targetID
        },
        {
          responseType: "arraybuffer",
          timeout: 30000
        }
      );

      const imgPath = path.join(
        __dirname,
        "cache",
        `crush_${senderID}_${targetID}.png`
      );

      fs.writeFileSync(imgPath, res.data);

      const caption =
        crushCaptions[Math.floor(Math.random() * crushCaptions.length)];

      api.sendMessage(
        {
          body: `✧•❁𝐂𝐫𝐮𝐬𝐡❁•✧ 💖\n\n${caption}`,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );

    } catch (err) {
      console.error("❌ Crush Error:", err.message);

      api.sendMessage(
        "⚠️ Crush বানাতে সমস্যা হইছে!",
        threadID,
        messageID
      );
    }
  }
};
