// Demo topics: a 5-idea reference outline (feeds the judge, Learn chunks and pop questions) + jargon list.
// Each idea: idea (one line, judge reference), explain (Learn chunk, 2-3 sentences), alt (re-explain another way),
// check (quick question), answer (keywords a right answer contains).
export const TOPICS = {
  photosynthesis: {
    title: "Photosynthesis",
    jargon: ["chlorophyll", "chloroplast", "stomata", "glucose", "carbon dioxide", "atp"],
    outline: [
      { idea: "Plants make their own food from light, water and carbon dioxide.",
        explain: "Photosynthesis is how a plant cooks its own food. It uses three things: sunlight, water from the roots, and carbon dioxide from the air.",
        alt: "Think of the leaf as a tiny kitchen. The recipe needs sunlight as the stove, water and carbon dioxide as the ingredients, and the dish is food for the plant.",
        check: "What three things does a plant need for photosynthesis?", answer: ["light", "sun", "water", "carbon"] },
      { idea: "It happens in chloroplasts, which hold the green pigment chlorophyll.",
        explain: "This cooking happens inside tiny parts of leaf cells called chloroplasts. They contain chlorophyll, a green pigment that catches sunlight. That is why leaves look green.",
        alt: "Chlorophyll is like a solar panel inside the leaf. It soaks up light energy, and it sits inside small green packets called chloroplasts.",
        check: "Where in the leaf does photosynthesis happen?", answer: ["chloroplast", "chlorophyll", "leaf cell"] },
      { idea: "Carbon dioxide enters through stomata; water comes up from the roots.",
        explain: "Carbon dioxide gets into the leaf through tiny holes called stomata. Water travels up from the roots through thin tubes in the stem.",
        alt: "Picture the stomata as little mouths on the underside of the leaf that breathe in carbon dioxide, while the roots drink water and send it up like a straw.",
        check: "How does carbon dioxide get into the leaf?", answer: ["stomata", "pores", "holes"] },
      { idea: "Light energy turns them into glucose, and oxygen is released.",
        explain: "Using the light energy, the plant joins carbon dioxide and water to make glucose, a kind of sugar. Oxygen is left over, and the plant releases it into the air.",
        alt: "It's like baking: carbon dioxide and water go in, light is the heat, glucose comes out as the cake, and oxygen is the steam that escapes.",
        check: "What gas does a plant give out during photosynthesis?", answer: ["oxygen", "o2"] },
      { idea: "Glucose is used for energy and growth; this oxygen is what we breathe.",
        explain: "The plant uses glucose for energy and to build new parts so it can grow. Almost all the oxygen we breathe comes from photosynthesis, so our lives depend on it.",
        alt: "The glucose is the plant's lunch box: some it eats for energy, some it uses as bricks to grow. The leftover oxygen is the air in our lungs.",
        check: "What does the plant do with the glucose it makes?", answer: ["energy", "grow", "food", "starch"] },
    ],
  },
  "newton's third law": {
    title: "Newton's third law",
    jargon: ["reaction force", "interaction pair", "momentum", "thrust", "normal force", "inertia", "net force"],
    outline: [
      { idea: "Every action has an equal and opposite reaction.",
        explain: "Newton's third law says that for every action there is an equal and opposite reaction. When you push on something, it pushes back on you just as hard.",
        alt: "Forces always come in twins. If you press your hand on a wall, the wall presses back on your hand with exactly the same strength.",
        check: "What does Newton's third law say?", answer: ["equal", "opposite", "reaction"] },
      { idea: "The two forces act on different objects, so they don't cancel.",
        explain: "The two forces act on two different objects. That is why they don't cancel out. Your push acts on the wall, and the wall's push acts on you.",
        alt: "Cancelling only happens when two forces act on the same thing. Here one force is on the wall and the other is on you, so each object feels its own force.",
        check: "Why don't action and reaction forces cancel each other?", answer: ["different", "objects", "two"] },
      { idea: "Walking: you push the ground back, the ground pushes you forward.",
        explain: "Walking is the third law in action. Your foot pushes the ground backwards, and the ground pushes you forwards. On ice there is little grip, so this is hard.",
        alt: "Try walking on a skateboard: you push back and the board rolls away. On solid ground the floor doesn't move, so its push sends you forward instead.",
        check: "When you walk, which way does the ground push you?", answer: ["forward", "front", "ahead"] },
      { idea: "Rockets push gas down and are pushed up (thrust).",
        explain: "A rocket pushes hot gas out of its bottom at high speed. The gas pushes the rocket up with an equal force, called thrust. It works even in space where there is no air.",
        alt: "Let go of a blown-up balloon: air rushes out one way and the balloon zooms the other way. A rocket is a giant, controlled balloon.",
        check: "What pushes a rocket upwards?", answer: ["gas", "exhaust", "thrust"] },
      { idea: "Equal forces can cause different motion because masses differ.",
        explain: "Equal forces don't mean equal motion. When a bat hits a ball, both feel the same force, but the light ball flies off while the heavy bat barely slows down.",
        alt: "Push off a friend while you both stand on skates: you feel the same push, but the lighter person rolls away faster.",
        check: "If a truck and a bicycle collide, which feels the bigger force?", answer: ["same", "equal", "both"] },
    ],
  },
  "electric current": {
    title: "Electric current",
    jargon: ["charge", "electron", "voltage", "resistance", "ampere", "coulomb", "circuit", "conductor"],
    outline: [
      { idea: "Electric current is the flow of electric charge.",
        explain: "Electric current is the flow of electric charge through a material. In metal wires, the moving charges are tiny particles called electrons.",
        alt: "Think of water flowing in a pipe. Current is like the amount of water passing a point every second, except here it is charge moving through a wire.",
        check: "What is electric current?", answer: ["flow", "charge", "electron"] },
      { idea: "It is measured in amperes; 1 A is one coulomb per second.",
        explain: "We measure current in amperes, or amps. One ampere means one coulomb of charge passing a point every second. An ammeter is the tool that measures it.",
        alt: "Amps count how much charge rushes past each second, like counting how many people walk through a gate per second.",
        check: "What unit is current measured in?", answer: ["ampere", "amp"] },
      { idea: "Current needs a closed circuit; a break stops it.",
        explain: "Current only flows in a closed loop called a circuit. If there is a break anywhere, like an open switch, the flow stops and the bulb goes off.",
        alt: "A circuit is like a race track. If one piece of track is missing, no car can complete the lap, so everything stops.",
        check: "What happens to the current when you open a switch?", answer: ["stop", "no current", "break", "off"] },
      { idea: "Voltage pushes the charge; resistance opposes it (Ohm's law V = IR).",
        explain: "Voltage is the push that drives charge around the circuit, and resistance is what slows it down. Ohm's law links them: voltage equals current times resistance.",
        alt: "Voltage is how hard the water pump pushes, and resistance is how narrow the pipe is. More push means more flow, a narrower pipe means less.",
        check: "If resistance goes up and voltage stays the same, what happens to current?", answer: ["decrease", "less", "lower", "drop"] },
      { idea: "Conventional current flows + to -, electrons flow the other way.",
        explain: "By old convention, current flows from the positive terminal to the negative. Electrons actually move the other way, from negative to positive.",
        alt: "Scientists picked a direction before they knew about electrons. So the arrow on diagrams goes plus to minus, while the real electrons drift minus to plus.",
        check: "Which way do electrons actually move in a circuit?", answer: ["negative to positive", "minus to plus", "opposite"] },
    ],
  },
};

// Hindi (Devanagari) and Hinglish (Roman) versions of the demo topics. Same shape as TOPICS entries;
// title/jargon/outline replace the English ones when that language is picked. en = TOPICS itself.
const I = (idea, explain, alt, check, answer) => ({ idea, explain, alt, check, answer });
export const TOPIC_I18N = {
  photosynthesis: {
    hi: { title: "प्रकाश संश्लेषण", jargon: ["क्लोरोफिल", "क्लोरोप्लास्ट", "स्टोमेटा", "ग्लूकोज़", "कार्बन डाइऑक्साइड"], outline: [
      I("पौधे रोशनी, पानी और कार्बन डाइऑक्साइड से अपना खाना खुद बनाते हैं।", "प्रकाश संश्लेषण वह तरीका है जिससे पौधा अपना खाना खुद पकाता है। इसके लिए तीन चीज़ें चाहिए: धूप, जड़ों से पानी और हवा से कार्बन डाइऑक्साइड।", "पत्ती को एक छोटी रसोई समझो। धूप चूल्हा है, पानी और कार्बन डाइऑक्साइड सामग्री हैं, और बना हुआ पकवान पौधे का खाना है।", "प्रकाश संश्लेषण के लिए पौधे को कौन सी तीन चीज़ें चाहिए?", ["धूप", "रोशनी", "पानी", "कार्बन"]),
      I("यह क्लोरोप्लास्ट में होता है, जिनमें हरा रंग क्लोरोफिल होता है।", "यह खाना पत्ती की कोशिकाओं के छोटे हिस्सों में बनता है जिन्हें क्लोरोप्लास्ट कहते हैं। इनमें क्लोरोफिल होता है, एक हरा रंग जो धूप पकड़ता है।", "क्लोरोफिल पत्ती के अंदर एक सोलर पैनल जैसा है। यह रोशनी सोखता है और छोटे हरे पैकेटों में रहता है जिन्हें क्लोरोप्लास्ट कहते हैं।", "पत्ती में प्रकाश संश्लेषण कहाँ होता है?", ["क्लोरोप्लास्ट", "क्लोरोफिल", "कोशिका"]),
      I("कार्बन डाइऑक्साइड स्टोमेटा से अंदर आती है और पानी जड़ों से ऊपर आता है।", "कार्बन डाइऑक्साइड पत्ती में छोटे छेदों से आती है जिन्हें स्टोमेटा कहते हैं। पानी जड़ों से तने की पतली नलियों के रास्ते ऊपर आता है।", "स्टोमेटा को पत्ती के नीचे छोटे मुँह समझो जो कार्बन डाइऑक्साइड अंदर लेते हैं। जड़ें स्ट्रॉ की तरह पानी पीकर ऊपर भेजती हैं।", "कार्बन डाइऑक्साइड पत्ती के अंदर कैसे जाती है?", ["स्टोमेटा", "छेद"]),
      I("रोशनी की ऊर्जा से ग्लूकोज़ बनता है और ऑक्सीजन बाहर निकलती है।", "रोशनी की ऊर्जा से पौधा कार्बन डाइऑक्साइड और पानी को जोड़कर ग्लूकोज़ बनाता है, जो एक तरह की शक्कर है। ऑक्सीजन बच जाती है और पौधा उसे हवा में छोड़ देता है।", "यह केक बनाने जैसा है: कार्बन डाइऑक्साइड और पानी अंदर जाते हैं, रोशनी गर्मी है, ग्लूकोज़ केक है और ऑक्सीजन भाप की तरह निकलती है।", "प्रकाश संश्लेषण में पौधा कौन सी गैस छोड़ता है?", ["ऑक्सीजन"]),
      I("ग्लूकोज़ ऊर्जा और बढ़ने के काम आता है; यही ऑक्सीजन हम साँस में लेते हैं।", "पौधा ग्लूकोज़ को ऊर्जा के लिए और नए हिस्से बनाने के लिए इस्तेमाल करता है। जो ऑक्सीजन हम साँस में लेते हैं वह लगभग पूरी इसी से आती है।", "ग्लूकोज़ पौधे का टिफ़िन है: कुछ वह ऊर्जा के लिए खाता है, कुछ से ईंटों की तरह बढ़ता है। बची हुई ऑक्सीजन हमारे फेफड़ों की हवा है।", "पौधा अपने बनाए ग्लूकोज़ का क्या करता है?", ["ऊर्जा", "बढ़", "खाना"]),
    ] },
    hinglish: { title: "Photosynthesis", jargon: ["chlorophyll", "chloroplast", "stomata", "glucose", "carbon dioxide"], outline: [
      I("Plants light, paani aur carbon dioxide se apna khana khud banate hain.", "Photosynthesis woh tareeka hai jisse plant apna khana khud banata hai. Isme teen cheezein lagti hain: sunlight, roots se paani, aur hawa se carbon dioxide.", "Leaf ko ek chhoti kitchen samjho. Sunlight stove hai, paani aur carbon dioxide ingredients hain, aur jo dish banti hai woh plant ka khana hai.", "Photosynthesis ke liye plant ko kaun si teen cheezein chahiye?", ["light", "sun", "dhoop", "paani", "water", "carbon"]),
      I("Yeh chloroplast mein hota hai, jisme green pigment chlorophyll hota hai.", "Yeh cooking leaf cells ke chhote parts mein hoti hai jinhe chloroplast kehte hain. Inme chlorophyll hota hai, ek green pigment jo sunlight pakadta hai.", "Chlorophyll leaf ke andar ek solar panel jaisa hai. Yeh light soak karta hai aur chhote green packets mein rehta hai jinhe chloroplast kehte hain.", "Leaf mein photosynthesis kahan hota hai?", ["chloroplast", "chlorophyll", "cell"]),
      I("Carbon dioxide stomata se andar aati hai, paani roots se upar aata hai.", "Carbon dioxide leaf mein chhote holes se aati hai jinhe stomata kehte hain. Paani roots se stem ki patli tubes ke through upar aata hai.", "Stomata ko leaf ke neeche chhote mouths samjho jo carbon dioxide andar lete hain. Roots straw ki tarah paani peeke upar bhejte hain.", "Carbon dioxide leaf ke andar kaise jaati hai?", ["stomata", "holes", "chhed"]),
      I("Light energy se glucose banta hai aur oxygen release hoti hai.", "Light energy se plant carbon dioxide aur paani ko jodke glucose banata hai, jo ek type ki sugar hai. Oxygen bach jaati hai aur plant use hawa mein chhod deta hai.", "Yeh baking jaisa hai: carbon dioxide aur paani andar, light heat hai, glucose cake hai aur oxygen steam ki tarah nikal jaati hai.", "Photosynthesis mein plant kaun si gas chhodta hai?", ["oxygen", "o2"]),
      I("Glucose energy aur growth ke kaam aata hai; yahi oxygen hum saans mein lete hain.", "Plant glucose ko energy ke liye aur naye parts banane ke liye use karta hai. Jo oxygen hum saans mein lete hain woh almost poori photosynthesis se aati hai.", "Glucose plant ka lunch box hai: thoda energy ke liye khata hai, thoda bricks ki tarah grow karne mein lagata hai. Bachi hui oxygen hamare lungs ki hawa hai.", "Plant apne banaye glucose ka kya karta hai?", ["energy", "grow", "khana", "food"]),
    ] },
  },
  "newton's third law": {
    hi: { title: "न्यूटन का तीसरा नियम", jargon: ["प्रतिक्रिया बल", "संवेग", "थ्रस्ट", "जड़त्व", "नेट बल"], outline: [
      I("हर क्रिया की बराबर और उल्टी प्रतिक्रिया होती है।", "न्यूटन का तीसरा नियम कहता है कि हर क्रिया की बराबर और उल्टी प्रतिक्रिया होती है। जब तुम किसी चीज़ को धक्का देते हो, वह तुम्हें उतने ही ज़ोर से वापस धक्का देती है।", "बल हमेशा जुड़वाँ आते हैं। दीवार पर हाथ दबाओ, तो दीवार भी तुम्हारे हाथ को ठीक उतने ही ज़ोर से दबाती है।", "न्यूटन का तीसरा नियम क्या कहता है?", ["बराबर", "उल्टी", "प्रतिक्रिया"]),
      I("दोनों बल अलग अलग चीज़ों पर लगते हैं, इसलिए कटते नहीं।", "दोनों बल दो अलग चीज़ों पर लगते हैं। इसीलिए वे एक दूसरे को काटते नहीं हैं।", "बल तभी कटते हैं जब वे एक ही चीज़ पर लगें। यहाँ एक बल दीवार पर है और दूसरा तुम पर, तो हर चीज़ अपना बल महसूस करती है।", "क्रिया और प्रतिक्रिया बल एक दूसरे को क्यों नहीं काटते?", ["अलग", "दो"]),
      I("चलना: तुम ज़मीन को पीछे धकेलते हो, ज़मीन तुम्हें आगे धकेलती है।", "चलना तीसरे नियम का उदाहरण है। तुम्हारा पैर ज़मीन को पीछे धकेलता है और ज़मीन तुम्हें आगे धकेलती है।", "स्केटबोर्ड पर चलकर देखो: तुम पीछे धकेलते हो और बोर्ड लुढ़क जाता है। पक्की ज़मीन हिलती नहीं, इसलिए उसका धक्का तुम्हें आगे भेजता है।", "चलते समय ज़मीन तुम्हें किस तरफ़ धकेलती है?", ["आगे"]),
      I("रॉकेट गैस नीचे फेंकता है और ऊपर धकेला जाता है (थ्रस्ट)।", "रॉकेट तेज़ गर्म गैस नीचे से बाहर फेंकता है। गैस रॉकेट को बराबर बल से ऊपर धकेलती है, जिसे थ्रस्ट कहते हैं।", "फूले हुए गुब्बारे को छोड़ दो: हवा एक तरफ़ निकलती है और गुब्बारा दूसरी तरफ़ भागता है। रॉकेट एक बड़ा, काबू वाला गुब्बारा है।", "रॉकेट को ऊपर कौन धकेलता है?", ["गैस", "थ्रस्ट"]),
      I("बराबर बल से अलग गति हो सकती है क्योंकि द्रव्यमान अलग होते हैं।", "बराबर बल का मतलब बराबर गति नहीं है। बल्ला गेंद को मारता है तो दोनों को बराबर बल लगता है, पर हल्की गेंद उड़ जाती है और भारी बल्ला मुश्किल से धीमा होता है।", "स्केट्स पर खड़े होकर दोस्त को धक्का दो: दोनों को बराबर धक्का लगता है, पर हल्का वाला तेज़ी से दूर जाता है।", "ट्रक और साइकिल टकराएँ तो किसे ज़्यादा बल लगता है?", ["बराबर", "दोनों", "एक जैसा"]),
    ] },
    hinglish: { title: "Newton ka third law", jargon: ["reaction force", "momentum", "thrust", "inertia", "net force"], outline: [
      I("Har action ka equal aur opposite reaction hota hai.", "Newton ka third law kehta hai ki har action ka equal aur opposite reaction hota hai. Jab tum kisi cheez ko push karte ho, woh tumhe utni hi zor se wapas push karti hai.", "Forces hamesha jodi mein aati hain. Deewar pe haath dabao, toh deewar bhi tumhare haath ko exactly utni hi zor se dabati hai.", "Newton ka third law kya kehta hai?", ["equal", "opposite", "reaction", "barabar", "ulta"]),
      I("Dono forces alag objects pe lagti hain, isliye cancel nahi hoti.", "Dono forces do alag objects pe lagti hain. Isliye woh ek doosre ko cancel nahi karti.", "Cancel tabhi hota hai jab dono forces ek hi cheez pe lagein. Yahan ek force deewar pe hai aur doosri tum pe, toh har object apni force feel karta hai.", "Action aur reaction forces cancel kyun nahi hoti?", ["alag", "different", "do", "two"]),
      I("Walking: tum ground ko peeche push karte ho, ground tumhe aage push karta hai.", "Chalna third law ka example hai. Tumhara pair ground ko peeche push karta hai aur ground tumhe aage push karta hai.", "Skateboard pe chal ke dekho: tum peeche push karte ho aur board ludak jaata hai. Solid ground hilta nahi, isliye uska push tumhe aage bhejta hai.", "Chalte waqt ground tumhe kis taraf push karta hai?", ["aage", "forward"]),
      I("Rocket gas neeche phenkta hai aur upar push hota hai (thrust).", "Rocket garam gas ko tezi se neeche se bahar phenkta hai. Gas rocket ko equal force se upar push karti hai, jise thrust kehte hain.", "Phoola hua balloon chhod do: hawa ek taraf nikalti hai aur balloon doosri taraf bhaagta hai. Rocket ek bada, controlled balloon hai.", "Rocket ko upar kaun push karta hai?", ["gas", "thrust", "exhaust"]),
      I("Equal force se alag motion ho sakta hai kyunki mass alag hota hai.", "Equal force ka matlab equal motion nahi hai. Bat ball ko maarta hai toh dono ko same force lagti hai, par halki ball udd jaati hai aur bhaari bat mushkil se slow hota hai.", "Skates pe khade hoke dost ko push karo: dono ko same push lagta hai, par halka wala tezi se door jaata hai.", "Truck aur cycle takrayein toh kise zyada force lagti hai?", ["same", "equal", "dono", "barabar"]),
    ] },
  },
  "electric current": {
    hi: { title: "विद्युत धारा", jargon: ["आवेश", "इलेक्ट्रॉन", "वोल्टेज", "प्रतिरोध", "एम्पियर", "कूलॉम", "परिपथ"], outline: [
      I("विद्युत धारा आवेश का बहाव है।", "विद्युत धारा किसी पदार्थ में आवेश का बहाव है। धातु के तारों में बहने वाले आवेश छोटे कण होते हैं जिन्हें इलेक्ट्रॉन कहते हैं।", "पाइप में बहते पानी को सोचो। धारा वैसी ही है, बस यहाँ पानी की जगह तार में आवेश बहता है।", "विद्युत धारा क्या है?", ["बहाव", "आवेश", "इलेक्ट्रॉन"]),
      I("धारा एम्पियर में मापी जाती है; 1 एम्पियर यानी एक कूलॉम प्रति सेकंड।", "धारा को एम्पियर में मापते हैं। एक एम्पियर का मतलब है हर सेकंड एक कूलॉम आवेश का गुज़रना।", "एम्पियर गिनता है कि हर सेकंड कितना आवेश गुज़रा, जैसे गिनना कि हर सेकंड कितने लोग गेट से निकले।", "धारा किस इकाई में मापी जाती है?", ["एम्पियर", "amp"]),
      I("धारा को बंद परिपथ चाहिए; कहीं टूटा तो धारा रुक जाती है।", "धारा सिर्फ़ एक बंद रास्ते में बहती है जिसे परिपथ कहते हैं। कहीं भी टूट हो, जैसे खुला स्विच, तो बहाव रुक जाता है और बल्ब बुझ जाता है।", "परिपथ रेस ट्रैक जैसा है। ट्रैक का एक टुकड़ा गायब हो तो कोई गाड़ी चक्कर पूरा नहीं कर सकती।", "स्विच खोलने पर धारा का क्या होता है?", ["रुक", "बंद", "नहीं"]),
      I("वोल्टेज आवेश को धकेलता है; प्रतिरोध उसे रोकता है (V = IR)।", "वोल्टेज वह धक्का है जो आवेश को परिपथ में घुमाता है, और प्रतिरोध उसे धीमा करता है। ओम का नियम कहता है: वोल्टेज बराबर धारा गुणा प्रतिरोध।", "वोल्टेज पानी के पंप का ज़ोर है और प्रतिरोध पाइप का पतलापन। ज़्यादा ज़ोर तो ज़्यादा बहाव, पतला पाइप तो कम बहाव।", "वोल्टेज वही रहे और प्रतिरोध बढ़े तो धारा का क्या होगा?", ["कम", "घट"]),
      I("पारंपरिक धारा + से - बहती है, इलेक्ट्रॉन उल्टी दिशा में।", "पुरानी परंपरा से धारा धनात्मक सिरे से ऋणात्मक सिरे की ओर बहती है। इलेक्ट्रॉन असल में उल्टी दिशा में, ऋण से धन की ओर चलते हैं।", "वैज्ञानिकों ने इलेक्ट्रॉन के बारे में जानने से पहले दिशा चुन ली थी। इसलिए चित्र में तीर प्लस से माइनस जाता है, पर इलेक्ट्रॉन माइनस से प्लस।", "परिपथ में इलेक्ट्रॉन असल में किस दिशा में चलते हैं?", ["ऋण से धन", "उल्टी", "माइनस से प्लस"]),
    ] },
    hinglish: { title: "Electric current", jargon: ["charge", "electron", "voltage", "resistance", "ampere", "coulomb", "circuit"], outline: [
      I("Electric current charge ka flow hai.", "Electric current kisi material mein electric charge ka flow hai. Metal wires mein jo charge move karta hai woh chhote particles hote hain jinhe electron kehte hain.", "Pipe mein behta paani socho. Current waisa hi hai, bas yahan paani ki jagah wire mein charge beh raha hai.", "Electric current kya hai?", ["flow", "charge", "electron", "behav"]),
      I("Current ampere mein measure hota hai; 1 A matlab ek coulomb per second.", "Current ko ampere ya amps mein measure karte hain. Ek ampere ka matlab hai har second ek coulomb charge ka guzarna.", "Amps count karta hai ki har second kitna charge guzra, jaise ginna ki har second kitne log gate se nikle.", "Current kis unit mein measure hota hai?", ["ampere", "amp"]),
      I("Current ko closed circuit chahiye; break ho toh current ruk jaata hai.", "Current sirf ek closed loop mein behta hai jise circuit kehte hain. Kahin bhi break ho, jaise open switch, toh flow ruk jaata hai aur bulb band ho jaata hai.", "Circuit ek race track jaisa hai. Track ka ek piece missing ho toh koi car lap poora nahi kar sakti.", "Switch kholne pe current ka kya hota hai?", ["ruk", "stop", "band", "off", "break"]),
      I("Voltage charge ko push karta hai; resistance use rokta hai (V = IR).", "Voltage woh push hai jo charge ko circuit mein ghumata hai, aur resistance use slow karta hai. Ohm's law kehta hai: voltage equals current into resistance.", "Voltage paani ke pump ka zor hai aur resistance pipe kitna patla hai. Zyada zor matlab zyada flow, patla pipe matlab kam flow.", "Voltage same rahe aur resistance badhe toh current ka kya hoga?", ["kam", "less", "decrease", "ghat"]),
      I("Conventional current + se - behta hai, electrons ulti direction mein.", "Purani convention se current positive terminal se negative ki taraf behta hai. Electrons actually ulti direction mein, negative se positive chalte hain.", "Scientists ne electrons ke baare mein jaanne se pehle direction chun li thi. Isliye diagram mein arrow plus se minus jaata hai, par electrons minus se plus.", "Circuit mein electrons actually kis direction mein chalte hain?", ["negative se positive", "minus se plus", "ulta", "opposite"]),
    ] },
  },
};
// The demo topic in the picked language (falls back to English).
export const localTopic = (key, lang) => ({ ...TOPICS[key], ...(TOPIC_I18N[key]?.[lang] || {}) });

// No key + unknown topic: a generic outline so the whole flow still runs.
export function mockTopic(title) {
  const t = title.trim();
  const ideas = [
    ["What it is", `Let's start with what ${t} actually is. Think of it in one plain sentence before any big words.`, `Another way to see ${t}: imagine explaining it to a ten-year-old using one picture.`],
    ["Its main parts", `Next, ${t} has a few main parts. Each part has its own job, and together they make the whole thing work.`, `Picture ${t} as a team: every player has a role.`],
    ["How it works", `Now, how does ${t} work, step by step? One thing leads to the next, like dominoes.`, `Think of ${t} as a recipe: first this, then that.`],
    ["A real-life example", `You can see ${t} around you in daily life. Spotting it at home makes it easier to remember.`, `Try to find ${t} in your kitchen, your street or your phone.`],
    ["Why it matters", `Finally, ${t} matters because it explains things we see every day and shows up in exams.`, `If ${t} vanished tomorrow, what would change? That is why it matters.`],
  ];
  return {
    title: t, mock: true,
    jargon: [t.toLowerCase()],
    outline: ideas.map(([idea, explain, alt]) => ({ idea: `${t}: ${idea.toLowerCase()}`, explain, alt, check: `Can you tell me ${idea.toLowerCase()} of ${t}?`, answer: [] })),
  };
}

// Pip's fixed lines, per picked language.
export const LANGS = {
  en: { label: "English", asr: "en-IN", tts: "en-IN", llm: "English" },
  hi: { label: "Hindi", asr: "hi-IN", tts: "hi-IN", llm: "Hindi in Devanagari script" },
  // Hinglish: en-IN ASR returns Roman script, which the model and en-IN voice both handle better than mixed scripts.
  hinglish: { label: "Hinglish", asr: "en-IN", tts: "en-IN", llm: "Hinglish (Hindi and English mixed, in Roman script), the same mix the student uses" },
};

export const PHRASES = {
  en: {
    teachMe: "Okay, teach me!", carryOn: "Shall I carry on?", didntCatch: "Sorry, I didn't catch that, can you say it again?",
    buzz: (t) => `Wait, wait! What does "${t}" mean?`, lost: "Hmm, I'm lost. Can you say a bit more?",
    learnIntro: (t) => `Let's learn ${t} together. Cut in any time by talking.`, checkIntro: "Quick check.",
    right: "Yes, that's right!", wrong: "Not quite. Let me explain that part another way.",
    moveOn: "Okay, let's keep going.", done: (t) => `That's the whole of ${t}. Nicely done!`,
    why: "But why does that happen? I don't get the why yet.", example: "Can you give me a real-life example, like something at home?",
    flaw: (s) => `Okay, so ${s}? Did I get that right?`, pop: (q) => `Pop question! ${q}`, flag: (i) => `Wait, I think a step is missing. What about this: ${i}`,
    ack: "Oh, I think I get it. What comes next?", goodQ: "Good question.", inShort: "Here it is in short:",
  },
  hi: {
    teachMe: "ठीक है, मुझे सिखाओ!", carryOn: "क्या मैं आगे बढ़ूँ?", didntCatch: "माफ़ करना, मैं समझ नहीं पाया, फिर से बोलोगे?",
    buzz: (t) => `रुको, रुको! "${t}" का मतलब क्या है?`, lost: "हम्म, मैं उलझ गया। थोड़ा और बताओ?",
    learnIntro: (t) => `चलो ${t} साथ में सीखते हैं। जब चाहो बोलकर रोक सकते हो।`, checkIntro: "एक छोटा सवाल।",
    right: "हाँ, बिल्कुल सही!", wrong: "पूरा सही नहीं। मैं इसे दूसरे तरीके से समझाता हूँ।",
    moveOn: "ठीक है, आगे चलते हैं।", done: (t) => `${t} पूरा हो गया। बहुत बढ़िया!`,
    why: "पर ऐसा क्यों होता है? मुझे वजह समझ नहीं आई।", example: "कोई असली ज़िंदगी का उदाहरण दो, जैसे घर में?",
    flaw: (s) => `अच्छा, तो ${s}? मैंने सही समझा?`, pop: (q) => `पॉप सवाल! ${q}`, flag: (i) => `रुको, एक कदम छूट गया लगता है: ${i}`,
    ack: "ओह, समझ गया। आगे क्या होता है?", goodQ: "अच्छा सवाल।", inShort: "छोटे में कहूँ तो:",
  },
  hinglish: {
    teachMe: "Okay, mujhe sikhao!", carryOn: "Shall I carry on? Aage badhun?", didntCatch: "Sorry, samajh nahi aaya, ek baar phir bolo?",
    buzz: (t) => `Ruko ruko! "${t}" ka matlab kya hai?`, lost: "Hmm, main lost ho gaya. Thoda aur batao?",
    learnIntro: (t) => `Chalo ${t} saath mein seekhte hain. Kabhi bhi bol ke rok sakte ho.`, checkIntro: "Quick check.",
    right: "Haan, bilkul sahi!", wrong: "Not quite. Main ise doosre tareeke se samjhata hoon.",
    moveOn: "Okay, aage chalte hain.", done: (t) => `${t} poora ho gaya. Bahut badhiya!`,
    why: "Par aisa kyun hota hai? Why samajh nahi aaya.", example: "Ek real-life example do na, jaise ghar mein?",
    flaw: (s) => `Achha, toh ${s}? Sahi samjha maine?`, pop: (q) => `Pop question! ${q}`, flag: (i) => `Ruko, ek step miss ho gaya lagta hai: ${i}`,
    ack: "Oh, samajh gaya. Aage kya hota hai?", goodQ: "Achha sawaal.", inShort: "Short mein:",
  },
};
