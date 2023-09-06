export const isValidYouTubeUrl = (url: string): boolean => {
  if (url == null) {
    return false;
  }

  // Regular expression to match YouTube video URLs
  const youtubeUrlPattern =
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+(&\S*)?$/;

  // Test if the URL matches the pattern
  return youtubeUrlPattern.test(url);
};
