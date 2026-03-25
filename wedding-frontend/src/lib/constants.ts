export const SHOOT_TYPES = [
  { id: "graduation", label: "Graduation Shoot" },
  { id: "casual", label: "Casual Shoot" },
  { id: "birthday", label: "Birthday Shoot" },
  { id: "wedding-pre", label: "Wedding Pre Shoot" },
  { id: "wedding", label: "Wedding Shoot" },
  { id: "event", label: "Event Shoot" },
] as const

export type ShootType = (typeof SHOOT_TYPES)[number]["id"]

// --- Package Constants ---
export const WEDDING_PACKAGES = ["The First Look", "The Vow", "The Romance", "Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III", "Customized"]
export const HOMECOMING_PACKAGES = ["The First Look", "The Vow", "The Romance", "Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III", "Customized"] 
export const ENGAGEMENT_PACKAGES = ["Engagement Package", "Customized"]
export const PRESHOOT_PACKAGES = ["Pre-shoot Package", "Customized"]

export const WEDDING_ADDONS = ["Upto 45min Full Video", "Full Day Drone Video Coverage", "To Cover the additional function (Church/Thali/Poruwa)", "01. Insta Reel", "Same Day edit"]
export const HOMECOMING_ADDONS = ["Upto 45min Full Video", "Full Day Drone Video Coverage", "To Cover the additional function (Church/Thali/Poruwa)", "01. Insta Reel", "Same Day edit"]
export const ENGAGEMENT_ADDONS = ["Full Day Drone Coverage", "01 min Insta Reel", "Same Day Trailer"]
export const PRESHOOT_ADDONS = ["Full Day Drone Coverage", "01 min Insta Reel", "Additional Camera"]
export const GENERAL_ADDONS = ["HDD with Raw footage", "LED Wall (8x12)", "Design Wooden Pen Drive", "Live broadcasting (Three Camera)"]

export const PACKAGE_DETAILS: Record<string, string[]> = {
  "The First Look": [
    "Bride & Groom getting ready moments",
    "Portrait session",
    "Ceremony & Reception highlights",
    "Exclusive 10 Hours Coverage",
    "Two Cinematographers",
    "Film Color Grading",
    "Wireless microphone",
    "Upto 45 min Full Video",
    "Upto 04 min Cinematic Trailer",
    "02 Insta Reel Videos",
    "4K Ultra HD Web Delivery"
  ],
  "The Vow": [
    "Bride & Groom getting ready moments",
    "Portrait session",
    "Ceremony & Reception highlights",
    "Exclusive 12 Hours Coverage",
    "Two Cinematographers & One Standby Camera",
    "Film Color Grading",
    "Dedicated audio recording devices & Wireless microphone",
    "Drone coverage for portrait session",
    "Upto 60 min Full Video",
    "Upto 06 min Cinematic Story Teller",
    "Same Day Edited 02 Insta Reel Videos",
    "4K Ultra HD Web Delivery"
  ],
  "The Romance": [
    "Bride & Groom getting ready moments",
    "Portrait session",
    "Ceremony & Reception highlights",
    "Exclusive 12 Hours Coverage",
    "Three Cinematographers & One Standby Camera",
    "LOG Profile shooting & Film Color Grading",
    "Dedicated audio recording devices Wireless microphone",
    "Drone Included",
    "Upto 90 min Full Video",
    "Upto 10 min Cinematic Story Teller",
    "Same Day Edited 02 Insta Reel Videos",
    "4K Ultra HD Web Delivery"
  ],
  "Wed + HC P-I": [
    "Wedding -10 Hours Coverage",
    "Two Cinematographers",
    "Film Color Grading",
    "Wireless microphone",
    "Bride & Groom getting ready moments",
    "Portrait session",
    "Wedding Ceremony & Reception highlights",
    "Upto 45 min Full Video",
    "Upto 04 min Cinematic Trailer",
    "02 Insta Reel Videos",
    "Homecoming - 08 Hours Coverage",
    "Two Cinematographers",
    "Film Color Grading",
    "Audio recording devices",
    "Homecoming Ceremony & Reception highlights",
    "Upto 40 min Full Video",
    "Upto 03 min Cinematic Trailer",
    "02 Insta Reel Videos",
    "4K Ultra HD Web Delivery"
  ],
  "Wed + HC P-II": [
    "Wedding -12 Hours Coverage",
    "Two Cinematographers & One Standby Camera",
    "Film Color Grading",
    "Dedicated audio recording devices Wireless microphone",
    "Drone coverage for portrait session",
    "Bride & Groom getting ready moments",
    "Portrait session",
    "Wedding Ceremony & Reception highlights",
    "LED Wall 8x12*",
    "Upto 60 min Full Video",
    "Upto 06 min Cinematic Story Teller",
    "Same Day Edited 02 Insta Reel Videos",
    "Homecoming - 08 Hours Coverage",
    "Two Cinematographers",
    "Film Color Grading",
    "Wireless microphone",
    "Homecoming Ceremony & Reception highlights",
    "Upto 40 min Full Video",
    "Upto 03 min Cinematic Trailer",
    "02 Insta Reel Videos",
    "4K Ultra HD Web Delivery"
  ],
  "Wed + HC P-III": [
    "Wedding -12 Hours Coverage",
    "Three Cinematographers & One Standby Camera",
    "LOG Profile shooting & Film Color Grading",
    "Dedicated audio recording devices & Wireless microphone",
    "Drone Included",
    "Bride & Groom getting ready moments",
    "Portrait session",
    "Wedding Ceremony & Reception highlights",
    "LED Wall 8x12*",
    "Upto 90 min Full Video",
    "Upto 10 min Cinematic Story Teller",
    "Same Day Edited 02 Insta Reel Videos",
    "Homecoming - 10 Hours Coverage",
    "Two Cinematographers & One Standby Camera",
    "Drone coverage for portrait session",
    "Homecoming Ceremony & Reception highlights",
    "LED Wall 8x 12*",
    "Upto 50 min Full Video",
    "Upto 05 min Cinematic Story Teller",
    "Same Day Edited 02 Insta Reel Videos",
    "4K Ultra HD Web Delivery"
  ],
  "Pre-shoot Package": [
    "Exclusive 05 Hours Coverage",
    "One Cinematographer",
    "Film Color Grading",
    "Upto 03 min Cinematic Trailer",
    "02 Insta Reel",
    "4K Ultra HD Web Delivery"
  ],
  "Engagement Package": [
    "Exclusive 06 Hours Coverage",
    "One Cinematographer",
    "Film Color Grading",
    "Audio recording devices",
    "Upto 30 min Full Video",
    "Upto 03 min Cinematic Trailer",
    "02 Insta Reel",
    "4K Ultra HD Web Delivery"
  ]
}

export const TERMS_OF_SERVICE = [
  {
    title: "How to make a reservation?",
    content: [
      "Our staff will assist you in making the best decision after you have thoroughly read our package guide and the service contract given to you. Upon selecting an appropriate package, a deposit of 25,000 LKR should be made to our bank account. Upon receiving any plausible proof of the payment, we will give you an invoice and put you in the schedule. The full payment for your selected package should be completed one week prior to the event date."
    ]
  },
  {
    title: "Reservations / Date changes",
    content: [
      "All tentative reservations are only valid for a week. If the reservations are not confirmed before the required seven days, we will consider the reservation as canceled and release the date from further holding. Before a period of 4 months from the reserved date, any changes to the reservation dates will be accessible for free; if not, an additional payment equivalent to the initial payment must be made. All payments made in advance are not refundable. Date changes that must be made with less than 4 months' notice for any unforeseen circumstances, such as COVID or any other global periods of distress, will also be free of charge; however, changes that are required because of personal reasons will still be non-refundable but can potentially transferred to a close relative, a friend, or any other preferred individual."
    ]
  },
  {
    title: "Price increments",
    content: [
      "Unfortunate price increases that cannot be controlled by these anticipated rates may occur in these periods of perpetual inflation. If such an increase were to occur, you would be notified before the additional amount was added to your existing costs. Please be aware that this additional will solely be calculated, considering the cost into account rather than profit-generating."
    ]
  },
  {
    title: "Transportation and Accommodation",
    content: [
      "A transportation fee in addition to the package you selected will be assessed for your location. Due to the unpredictability of fuel price fluctuations, the exact charge will only be disclosed two days prior to the function. Crew lodging should be offered in a select few locations, or else compensation of an additional payment should be made. Depending on the area, these extra expenses could differ, and they would only be influenced by current fuel prices."
    ]
  },
  {
    title: "Agenda/Time frame",
    content: [
      "To avoid any disagreements that could disrupt the function's orderly flow, the function's finished agenda should be distributed two days before the function. Along with the agenda, information should also be provided if there is any chance that the event will go on past the duration given for a certain package.",
      "Our coverage does not exceed for the time period specified in any selected package. In a scenario in which the allotted time is exceeded, each hour exceeding that amount will be charged at a rate of one hour. This is expected to cost you 10,000 LKR every hour. We'll be at your hotel room or salon (close to the event venue) to take pictures of you getting ready; this time will count as the first segment of the time period allotted for your package."
    ]
  },
  {
    title: "Things to be provided at the function",
    content: [
      "A separate table at the event should be set up for the videography team, which might be shared by the team entrusted with capturing wedding pictures and the planning team (excluding the band). Any damages to the equipment that occur should be compensated by the client party if the crew is required to share a guest table.",
      "The dancing floor or even function will not be covered if the laser lights are used. The Lasers may cause severe damages to the cameras and other equipment.",
      "If the crew is not entitled to meals, kindly notify us in advance so we may make arrangements for our own meals, which would require us to take between 40 to 60 minutes off from the function."
    ]
  },
  {
    title: "How does the post processing been done?",
    content: [
      "Your video footage will be securely backed up on our servers as soon as the videographers arrive at our location. Our team will get in touch with you and set up a time for you to come to our location and collect your own video footage if you require any additional information about the entire function. The client will incur an additional payment. ( HDD with all Raw Footages, 25000 LKR ).",
      "The editing style of One Promise is entirely unique and distinctive and it is unable to change or remove during the amendments unless you notify us about your shooting preferences and special requirements beforehand the event.",
      "“ The First Version ”, also known as the first cut, will be sent to the client via a Drive link so they can download the video. In case of amendments, the client shall provide the confirmation or written list of the amendments, from which the final version will be prepared. We recommend you to use the first version to make a list of all the amendments that need to be made. Please be aware that after the final version has been approved and delivered, we will NOT be able to make any more changes to your video. All footage from the event will be deleted from our system after the final version or edit has been completed.",
      "The final version/ edit will be sent to you within 15 days, depending on the external influences of the country, however we do offer you up to two revisions of amendments, which you must notify us of within two weeks after receiving the first version.",
      "In case of more changes or amendments, an additional amount of 5,000 LKR per each revision will be charged."
    ]
  },
  {
    title: "Delivery / Turn-around time",
    content: [
      "Timeline of sending the video links are as follows :",
      "- The Highlight Video/ Instagram Teaser - 30 days",
      "- The Full Wedding Video - 60 days",
      "If there're any requested amendments, it'll take 14 more days to get back with the final version. In case we didn’t hear from the client for more than 4 months, we will consider the finals as per the last edited version and evacuate all footage & project files from our servers. Also note that due to unpredictable circumstances in Sri Lanka, our processing times may vary, and clients will be expected to fully understand and manage any resulting delays.",
      "Soft copies are utilized throughout every final delivery. If you need a design pen drive it will be delivered on request. After approval the designed pen drive will be sent for making and as soon as it arrives at the studio (one week) we will inform you to collect your pen drive from the studio. Upon failure to collect the pen drive within two months we will not be held responsible for any damages sustained by your products."
    ]
  },
  {
    title: "How to handle technical failures?",
    content: [
      "In any case of unavoidable technical issue, the best decision is to be made with the consent of both the parties which will satisfy all parties concerned."
    ]
  },
  {
    title: "Termination due to lack of response",
    content: [
      "After 2 years from the event, if footage is not requested, we will declare that you are no longer interested in continuing and we shall no longer keep the backup. And if you do not collect your products within 2 months of production we are no longer responsible for their safe keeping. If you are unable to collect these physically you can inform the company to get them couriered to you.",
      "Any violation of these terms may result in termination of this agreement."
    ]
  },
  {
    title: "Copyrights",
    content: [
      "Service Provider has the right to use videos included in this contract for the purpose of advertising in social media, in exhibitions & in the studios."
    ]
  },
  {
    title: "In General",
    content: [
      "- The client is responsible for making sure that neither the placement of decorations nor the arrangement of guests doesn't obstruct the view of the bride, groom, celebrity or invited guest. Any shots that are missed or omitted as a result of an obstruction at the scene are not our responsibility.",
      "- One Promise cannot assure the natural or artificial disruptions of the video and audio produced at or by the event location since we are not in a position to interfere with the ceremony in any way unless to correct the least satisfactory shooting conditions.",
      "- The bride, groom, and the retinue shall attend the photo shoot on or before the decided time of the shoot and collaborate with the videographer in obtaining the desired shots/ scenes, including but not limited to specifying persons and/or scenes to be captured; taking few times to pose for videographer’s direction.",
      "- The team shall not be responsible for scenes not captured as a result of a delay from the Client's side such as a delay in bridal and hairdressing or any other failure to provide reasonable assistance or cooperation. - We don't capture group portraits on Video.",
      "- Package changes have to be made two weeks prior.",
      "- All rates are quoted in Sri Lankan Rupees (LKR) on the specified packages inclusive of all applicable taxes and charges.",
      "- Government taxes, fees and charges may vary from time to time and One Promise reserves the right to add these, effective from the date of implementation.",
      "- Additional charges, applicable taxes and fees will be charged on any additional services not already shown on this contract."
    ]
  }
]
