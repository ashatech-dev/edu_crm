export function getWelcomeEmailTemplate(username: string) {
  return {
    subject: `Welcome to Wingfi, ${username}!`,
    html: `
        <h1>Welcome, ${username} 👋</h1>
        <p>We're excited to have you on board!</p>
        <p>Explore amazing powerbanks & deals!</p>
      `,
    text: `Welcome, ${username}! Explore amazing powerbanks & deals.`,
  };
}
