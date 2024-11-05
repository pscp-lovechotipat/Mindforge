const generateAiServiceId = (length = 16) => {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    return Array.from(randomValues)
        .map((v) => characters[v % characters.length])
        .join("");
};

export default generateAiServiceId;