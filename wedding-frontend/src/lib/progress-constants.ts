export const PROGRESS_STEPS = [
  {
    id: 1,
    phase: "The Booking",
    title: "Agreement & Payment",
    systemStatus: "Verification Pending",
    clientView: "We are verifying your agreement and advance payment.",
    description: "Ensuring all booking details are secured."
  },
  {
    id: 2,
    phase: "The Safeguard",
    title: "Event Day (Live)",
    systemStatus: "Shooting in Progress",
    clientView: "Capturing your memories today!",
    description: "Our team is on-site capturing every moment."
  },
  {
    id: 3,
    phase: "The Safeguard",
    title: "Media Ingested",
    systemStatus: "Backing Up Files",
    clientView: "Photos safely backed up and secured in our vault.",
    description: "Triggered once cards are dumped and mirrored to two drives."
  },
  {
    id: 4,
    phase: "The First Look",
    title: "Sneak Peek Selection",
    systemStatus: "Culling Sneak Peeks",
    clientView: "Selecting the top 15–20 'Hero' shots.",
    description: "Selecting the top 15–20 'Hero' shots."
  },
  {
    id: 5,
    phase: "The First Look",
    title: "Sneak Peek Delivered",
    systemStatus: "Sneaks Sent",
    clientView: "Check your inbox! Your sneak peeks are ready.",
    description: "Email with a link to the mini-gallery."
  },
  {
    id: 6,
    phase: "The Deep Work",
    title: "Full Gallery Culling",
    systemStatus: "Culling Full Day",
    clientView: "Curating your full gallery.",
    description: "Removing blinks, duplicates, and test shots."
  },
  {
    id: 7,
    phase: "The Deep Work",
    title: "Color Grading & Editing",
    systemStatus: "Editing in Progress",
    clientView: "Applying our signature look to your photos.",
    description: "Applying presets, white balance, and exposure sync. (Usually takes the longest)"
  },
  {
    id: 8,
    phase: "Finalization",
    title: "Final Gallery Delivery",
    systemStatus: "Full Gallery Delivered",
    clientView: "Your full gallery is on its way!",
    description: "Digital high-res files sent via your hosting platform."
  },
  {
    id: 9,
    phase: "Finalization",
    title: "Album Design (Optional)",
    systemStatus: "Album Layout Design",
    clientView: "Designing your heirloom album.",
    description: "Layout design for the physical album."
  },
  {
    id: 10,
    phase: "Finalization",
    title: "Archive & Complete",
    systemStatus: "Completed",
    clientView: "Project completed and archived.",
    description: "Move files to long-term cold storage."
  }
] as const;
