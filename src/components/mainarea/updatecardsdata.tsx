interface UpdateCardData {
  initials: string;
  heading: string;
  subject: string;
  senddate: string;
}

const updateCards: UpdateCardData[] = [
  {
    initials: 'AB',
    heading: 'New message',
    subject: 'Project update from the design team',
    senddate: '2h ago',
  },
  {
    initials: 'JS',
    heading: 'Meeting reminder',
    subject: 'Weekly sync starts in 15 minutes',
    senddate: '15m ago',
  },
  {
    initials: 'RK',
    heading: 'Task assigned',
    subject: 'Review the Q3 budget spreadsheet',
    senddate: '1d ago',
  },
  {
    initials: 'MT',
    heading: 'Comment added',
    subject: 'Left feedback on your latest PR',
    senddate: '3h ago',
  },
  {
    initials: 'LP',
    heading: 'File shared',
    subject: 'Marketing_deck_final_v2.pptx',
    senddate: '5d ago',
  },
];

export default updateCards;